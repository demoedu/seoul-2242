import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Scene } from './types';
import { generateSceneAndImage } from './services/geminiService';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import Header from './components/Header';
import { Part } from '@google/genai';

// localStorage 이미지 저장/불러오기 함수들
const GAME_IMAGE_KEY = 'seoul-2242-current-image';
const GAME_STORY_KEY = 'seoul-2242-story-log';

const saveImageToStorage = (imageBase64: string) => {
  try {
    localStorage.setItem(GAME_IMAGE_KEY, imageBase64);
  } catch (error) {
    console.warn('이미지를 localStorage에 저장하는데 실패했습니다:', error);
  }
};

const loadImageFromStorage = (): string | null => {
  try {
    return localStorage.getItem(GAME_IMAGE_KEY);
  } catch (error) {
    console.warn('localStorage에서 이미지를 불러오는데 실패했습니다:', error);
    return null;
  }
};

const saveStoryToStorage = (storyLog: string[]) => {
  try {
    localStorage.setItem(GAME_STORY_KEY, JSON.stringify(storyLog));
  } catch (error) {
    console.warn('스토리를 localStorage에 저장하는데 실패했습니다:', error);
  }
};

const loadStoryFromStorage = (): string[] | null => {
  try {
    const saved = localStorage.getItem(GAME_STORY_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('localStorage에서 스토리를 불러오는데 실패했습니다:', error);
    return null;
  }
};

const clearGameStorage = () => {
  try {
    localStorage.removeItem(GAME_IMAGE_KEY);
    localStorage.removeItem(GAME_STORY_KEY);
  } catch (error) {
    console.warn('localStorage를 초기화하는데 실패했습니다:', error);
  }
};

// Helper to convert image URL to Gemini Part format
const urlToGenerativePart = async (url: string, mimeType: string = 'image/png'): Promise<Part> => {
    // Handle base64 data URLs
    if (url.startsWith('data:')) {
        return {
            inlineData: {
                data: url.split(',')[1],
                mimeType: url.match(/data:(.*);/)?.[1] ?? mimeType,
            },
        };
    }
    // Handle regular URLs
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}. Status: ${response.status}`);
    }
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error('FileReader did not return a string.'));
            }
            const base64data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64data,
                    mimeType: blob.type || mimeType,
                },
            });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [storyLog, setStoryLog] = useState<string[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('/image.png');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 localStorage에서 데이터 불러오기
  useEffect(() => {
    const savedImage = loadImageFromStorage();
    const savedStory = loadStoryFromStorage();
    
    if (savedImage && savedImage !== '/image.png') {
      setCurrentImage(savedImage);
    }
    
    if (savedStory && savedStory.length > 0) {
      setStoryLog(savedStory);
      // 스토리가 있다면 게임이 진행 중인 상태로 복원
      if (savedStory.length > 1) {
        setGameState(GameState.IN_GAME);
        // 마지막 설명으로부터 현재 scene을 재구성 (간단한 버전)
        const lastDescription = savedStory[savedStory.length - 1].replace(/^\n/, '');
        setCurrentScene({
          description: lastDescription,
          choices: ['계속하기', '새로운 길을 찾는다', '주변을 살핀다']
        });
      }
    }
  }, []);

  const initialScene: Scene = {
    description: "차가운 바람이 폐허가 된 도시의 틈새를 휘파람처럼 스쳐 지나간다. 당신은 종로의 한 무너진 건물 옥상에서 먼지를 뒤집어쓴 채 깨어난다. 머리는 깨질 듯 아프고, 지난 며칠간의 기억은 희미하다. 저 멀리, 무너진 남산 타워의 실루엣이 잿빛 하늘을 찌르고 있다. 생존을 위한 첫 걸음을 내디뎌야 한다.",
    choices: [
      "주변을 더 자세히 살펴본다.",
      "건물 아래로 내려갈 길을 찾는다.",
      "소지품을 확인한다.",
    ],
  };

  const handleStartGame = useCallback(() => {
    // 새 게임 시작 시 localStorage 초기화
    clearGameStorage();
    
    setCurrentScene(initialScene);
    setStoryLog([initialScene.description]);
    setCurrentImage('/image.png');
    setGameState(GameState.IN_GAME);
    setError(null);
    
    // 초기 상태 저장
    saveStoryToStorage([initialScene.description]);
  }, []);

  const handlePlayerAction = useCallback(async (action: string) => {
    if (!currentScene || isLoading) return;

    setIsLoading(true);
    setError(null);

    const fullHistory = [...storyLog, `\n> ${action}`].join('\n');
    
    try {
      const imagePart = await urlToGenerativePart(currentImage);
      const { scene: nextScene, imageBase64: nextImageBase64 } = await generateSceneAndImage(fullHistory, action, imagePart);
      
      if (nextScene) {
        setCurrentScene(nextScene);
        const newStoryLog = [...storyLog, `\n> ${action}`, `\n${nextScene.description}`];
        
        // 이미지가 생성되었으면 업데이트하고 localStorage에 저장
        if (nextImageBase64) {
          setCurrentImage(nextImageBase64);
          saveImageToStorage(nextImageBase64);
        }
        
        setStoryLog(newStoryLog);
        saveStoryToStorage(newStoryLog);
      } else {
        throw new Error("API로부터 유효한 장면을 받지 못했습니다.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`오류: ${errorMessage} 잠시 후 다시 시도해 주세요.`);
      setGameState(GameState.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [currentScene, storyLog, currentImage]);

  const handleRestart = () => {
      // 재시작 시 localStorage 초기화
      clearGameStorage();
      
      setStoryLog([]);
      setCurrentScene(null);
      setError(null);
      setCurrentImage('/image.png');
      setGameState(GameState.START_SCREEN);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.IN_GAME:
        return (
          <GameScreen
            storyLog={storyLog}
            scene={currentScene}
            onChoice={handlePlayerAction}
            onTextInput={handlePlayerAction}
            isLoading={isLoading}
          />
        );
      case GameState.ERROR:
         return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                 <p className="text-red-500 text-lg mb-4">{error}</p>
                 <button 
                     onClick={handleRestart}
                     className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                 >
                     다시 시작
                 </button>
             </div>
         );
      case GameState.START_SCREEN:
      default:
        return <StartScreen onStart={handleStartGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full h-auto max-h-[80vh] sticky top-[80px] rounded-lg overflow-hidden shadow-lg shadow-gray-900 border-2 border-gray-800">
          <img 
            src={currentImage} 
            alt="Post-apocalyptic Seoul scene" 
            className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
          />
        </div>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 min-h-[60vh] lg:min-h-[80vh] flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
