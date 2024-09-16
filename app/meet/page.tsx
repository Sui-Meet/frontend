'use client'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { motion, AnimatePresence } from 'framer-motion'
import { Pacifico, Roboto } from 'next/font/google'
import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, Loader2, Heart } from 'lucide-react'
import { Icon } from '@iconify/react'
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { useQuery } from '@tanstack/react-query';
import { like } from '@/contract'
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
})

interface SocialLink {
  icon: string
  title: string
  link: string
  placeholder: string
}

interface CustomLink {
  id: string
  icon: string
  title: string
  link: string
}

interface Card {
  id: string
  nickname: string
  about: string
  avatar: string
  backgroundColor: string
  textColor: string
  fixedSocialLinks: SocialLink[]
  customLinks: CustomLink[]
  likes: string[]
}

export default function Meet() {
  const { toast } = useToast()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  const [loadedText, setLoadedText] = useState('Sui Meet')
  const currentAccount = useCurrentAccount();
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const goToNextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (allCardList?.length || 0))
  }

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        })
      }
    }

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isHovered])

  const calculateTilt = () => {
    if (!cardRef.current) return { x: 0, y: 0 }
    const { width, height } = cardRef.current.getBoundingClientRect()
    const x = (mousePosition.x / width - 0.5) * 10
    const y = (mousePosition.y / height - 0.5) * -10
    return { x, y }
  }

  const tilt = calculateTilt()

  // 获取数据
  const getCardList = async () => {
    if (!currentAccount?.address) {
      toast({
        variant: "destructive",
        title: "Please connect wallet firstly.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
      return;
    }
    let cardList:any = [];

    const res: any = await client.getObject({
      id: `${process.env.NEXT_PUBLIC_CONTRACT_STATE}`,
      options: {
        showContent: true,
        showType: true
      }
    });
    console.log('test', res);
    
    if (res?.data?.type === `${process.env.NEXT_PUBLIC_CONTRACT_PACKAGE}::meet::State`) {
      const card_ids = res.data.content?.fields?.all_profiles || [];
      console.log('test1', res.data, card_ids);
      
      for (const i of card_ids) {
        const result:any = await client.getObject({
          id: i,
          options: {
            showContent: true,
            showType: true
          }
        });
        // 根据detail_blob获取walrus数据
        const StreamData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/?blobId=${result.data.content.fields.detail_blob}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        const JSONData = await operateData(StreamData)
        console.log('test2', JSONData);
        // 将likes添加到JSONData中
        const cardData = {
          ...JSONData,
          likes: result.data.content.fields.likes,
          profile_id: i
        };
        cardList.push(cardData);
      }
    }

    console.log('test', res, cardList);
    return cardList.reverse();
  }

  const { data: allCardList, isLoading, isError, refetch } = useQuery({
    queryKey: ['cardList', currentAccount?.address],
    queryFn: getCardList,
    enabled: !!currentAccount?.address,
  });

  const operateData = async (response:any) => {
    const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader?.read()!;
        if (value) {
          chunks.push(value);
        }
        done = readerDone;
      }

      // 将 Uint8Array[] 转换为单个 Uint8Array
      const combinedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        combinedChunks.set(chunk, offset);
        offset += chunk.length;
      }

      // 1. 将数据转换为文本
      const text = new TextDecoder().decode(combinedChunks);
      console.log("Text:", text, JSON.parse(text));
      const res = JSON.parse(text)
      return res
  }

  const currentCard = allCardList?.[currentIndex]
  const nextCardIndex = (currentIndex + 1) % (allCardList?.length || 0)
  const upcomingCard = allCardList?.[nextCardIndex]

  console.log('testsasa', currentCard);
  

  const handleLike = async (profile_id:string) => {
    if (!currentAccount?.address) {
      toast({
        variant: "destructive",
        title: "Please connect wallet firstly.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
      return;
    }
    // 调用likes合约
    try {
      if (currentAccount?.address) {
        const tx = await like(profile_id);
        console.log('test', tx)
        await signAndExecuteTransaction({
          transaction: tx as any,
        }, {
          onSuccess: async (result) => {
            toast({
              className: "bg-green-100 border-green-400 text-green-700",
              title: "Like successfully!"
            })
            console.log("Transaction successful:", result);
            await refetch();
            setCurrentIndex(currentIndex);
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            toast({
              variant: "destructive",
              title: "Transaction failed.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
          }
        })
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Like failed",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    }
  }

  const getContrastColor = (bgColor: string) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white depending on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className='absolute top-8 right-8 z-10'>
        <ConnectButton />
      </div>
      <div className='absolute top-10 left-6 z-10'>
        <motion.h1 
          className={`${pacifico.className} text-3xl font-bold text-white drop-shadow-lg transition-all duration-300`}
        >
          {loadedText.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              style={{
                display: "inline-block",
                willChange: "transform"
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>
      </div>
      
      {isLoading ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-white mb-4" />
          <div className="text-white text-xl">
            Loading
            <span className="animate-pulse"> .</span>
            <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
          </div>
        </div>
      ) : isError ? (
        <div className="text-white text-2xl">Error fetching card data. Please try again later.</div>
      ) : (
        /* 3D卡片查看器 */
        <div className="relative w-72 h-auto max-h-[calc(100vh-16rem)] z-30" style={{ perspective: '1500px' }}>
          {currentCard ? (
            <div 
              className="w-full h-full" 
              style={{ 
                transformStyle: 'preserve-3d', 
                transform: `rotateY(-20deg) ${isHovered ? 'scale(1.05)' : ''}`,
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              ref={cardRef}
            >
              {/* Static stacked effect */}
              <div
                className="absolute inset-0 rounded-2xl shadow-lg"
                style={{ 
                  backgroundColor: upcomingCard?.backgroundColor || '#FFFFFF',
                  transform: 'translateZ(-40px) translateX(20px) scale(0.9)',
                }}
              />
              
              {/* Animated current card */}
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={currentIndex}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1, 
                    rotateX: isHovered ? tilt.y : 0,
                    rotateY: isHovered ? tilt.x : 0,
                  }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="rounded-2xl shadow-lg overflow-hidden h-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(20px)',
                  }}
                >
                  {/* Card background */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundColor: currentCard.backgroundColor || '#FFFFFF',
                      transform: 'translateZ(-1px)', // Slightly behind the content
                    }}
                  />
                  
                  {/* Card content */}
                  <div 
                    className="relative w-full h-full flex flex-col justify-start items-center p-6 cursor-pointer overflow-y-auto px-6"
                    style={{
                      color: currentCard.textColor || '#000000',
                      maxHeight: 'calc(100vh - 16rem)',
                    }}
                    onClick={goToNextCard}
                  >
                    {/* Like button */}
                    <motion.div
                      className="absolute top-4 right-4 z-10 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(currentCard.profile_id);
                      }}
                    >
                      <Heart
                        fill={currentCard.likes?.length ? '#FF69B4' : 'none'}
                        stroke={getContrastColor(currentCard.backgroundColor || '#FFFFFF') === '#000000' ? '#FF69B4' : getContrastColor(currentCard.backgroundColor || '#FFFFFF')}
                        size={28}
                      />
                      {currentCard.likes?.length > 0 && (
                        <span 
                          className="ml-1"
                          style={{ 
                            color: getContrastColor(currentCard.backgroundColor || '#FFFFFF') === '#000000' ? '#FF69B4' : getContrastColor(currentCard.backgroundColor || '#FFFFFF'),
                            fontSize: '14px'
                          }}
                        >
                          {currentCard.likes.length > 99 ? '99+' : currentCard.likes.length}
                        </span>
                      )}
                    </motion.div>

                    <motion.img 
                      src={currentCard.avatar ? `https://aggregator-devnet.walrus.space/v1/${currentCard.avatar}` : 'https://aggregator-devnet.walrus.space/v1/wnSMTuo7bXMUrqo6knVGb4Bsjmk0ryDrPl2zqwJXb2M'}
                      alt={currentCard.nickname || 'Anonymous'}
                      className="w-24 h-24 rounded-full mb-4 flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      initial={{ x: 300 }}
                      animate={{ x: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                    <motion.h2 
                      className="text-2xl font-bold mb-2 text-center w-full flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      initial={{ x: 300 }}
                      animate={{ x: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
                    >
                      {currentCard.nickname 
                        ? (currentCard.nickname.length > 20 
                            ? currentCard.nickname.slice(0, 20) + '...'
                            : currentCard.nickname)
                        : 'Anonymous'
                      }
                    </motion.h2>
                    <motion.p 
                      className="text-sm mb-4 text-center w-full flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      initial={{ x: 300 }}
                      animate={{ x: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
                    >
                      {currentCard.about
                        ? (currentCard.about.length > 50
                            ? currentCard.about.slice(0, 50) + '...'
                            : currentCard.about.split(' ').map((word:any, index:any) => (
                                <React.Fragment key={index}>
                                  {word}
                                  {index !== 0 && (index + 1) % 5 === 0 && <br />}
                                  {index !== 0 && (index + 1) % 5 !== 0 && ' '}
                                </React.Fragment>
                              )))
                        : "This person is lazy and left nothing behind."
                      }
                    </motion.p>
                    {currentCard.fixedSocialLinks && currentCard.fixedSocialLinks.length > 0 && (
                      <motion.div 
                        className="flex flex-wrap justify-center gap-2 mb-4 mx-1 flex-shrink-0"
                        initial={{ x: 300 }}
                        animate={{ x: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
                      >
                        {currentCard.fixedSocialLinks.map((link:any, index:any) => (
                          <motion.a
                            key={index}
                            href={link.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            className="flex justify-center items-center w-8 h-8"
                          >
                            <Icon icon={link.icon} className="text-2xl" />
                          </motion.a>
                        ))}
                      </motion.div>
                    )}
                    {currentCard.customLinks && currentCard.customLinks.length > 0 && (
                      <motion.div 
                        className="w-full space-y-2 px-4"
                        initial={{ x: 300 }}
                        animate={{ x: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.4 }}
                      >
                        {currentCard.customLinks.map((link:any, index:any) => (
                          <motion.a
                            key={link.id}
                            href={link.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 bg-gray-100 rounded"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Icon icon={link.icon} className="mr-2" />
                            <span>{link.title}</span>
                          </motion.a>
                        ))}
                      </motion.div>
                    )}
                    <ChevronRight className="absolute right-2 top-1/2 transform -translate-y-1/2" size={24} />
                  </div>

                  {/* Edge cover */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: currentCard.backgroundColor || '#FFFFFF' }} />
                    <div className="absolute bottom-0 left-0 w-full h-4" style={{ backgroundColor: currentCard.backgroundColor || '#FFFFFF' }} />
                    <div className="absolute top-0 left-0 w-4 h-full" style={{ backgroundColor: currentCard.backgroundColor || '#FFFFFF' }} />
                    <div className="absolute top-0 right-0 w-4 h-full" style={{ backgroundColor: currentCard.backgroundColor || '#FFFFFF' }} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-white text-2xl text-center font-semibold">
                Please connect your wallet to meet with friends and professionals.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </div>
  )
}