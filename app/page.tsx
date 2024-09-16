'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Card from '@/app/components/card'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Pacifico, Roboto } from 'next/font/google'
import { ChevronDown, UserPlus, ThumbsUp, Share2 } from 'lucide-react'

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
})

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

const slogans = [
  "Connect with friends and professionals.",
  "Discover meaningful relationships.",
  "Everything you are. In one, simple link in bio.",
  "The fast, friendly and powerful link in bio tool."
]

function FeatureCard({ icon, title, description }:any) {
  return (
    <motion.div 
      className="bg-white bg-opacity-20 p-6 rounded-lg text-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="text-white mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{description}</p>
    </motion.div>
  )
}

export default function Home() {
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [typedSlogan, setTypedSlogan] = useState('')
  const [sloganIndex, setSloganIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const currentAccount = useCurrentAccount();
  const [loadedText, setLoadedText] = useState('Sui Meet')
  const [showChevron, setShowChevron] = useState(true)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollPosition = latest + windowHeight

    if (scrollPosition >= documentHeight - 10) {
      setShowChevron(false)
    } else {
      setShowChevron(true)
    }
  })

  useEffect(() => {
    if (charIndex < slogans[sloganIndex].length) {
      const timer = setTimeout(() => {
        setTypedSlogan(prev => prev + slogans[sloganIndex][charIndex])
        setCharIndex(charIndex + 1)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setTypedSlogan('')
        setCharIndex(0)
        setSloganIndex((sloganIndex + 1) % slogans.length)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [charIndex, sloganIndex])

  const createProfile = () => {
    if (currentAccount?.address) {
      setIsFormOpen(true)
    } else {
      toast({
        variant: "destructive",
        title: "Please connect wallet firstly.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    }
  }

  return (    
    <div className="w-screen min-h-screen bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-4 overflow-hidden">
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
      {/* Animated background elements */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div> */}
      {/* Content */}
      {isFormOpen ? 
        <Card />
        : 
        <div className='text-white'>
          <div className="text-center overflow-visible pt-40 pb-20">
            <motion.h1 
              className={`${pacifico.className} text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg transition-all duration-300`}
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
            <p className={`${roboto.className} text-xl md:text-2xl text-white mb-8 h-8 drop-shadow-lg italic`}>{typedSlogan}</p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button 
                onClick={() => createProfile()}
                className="bg-white py-5 text-purple-600 hover:bg-purple-100 transition-all duration-300 transform hover:scale-105"
              >
                Create Your Card
              </Button>
            </motion.div>
          </div>

          <section className=''>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<UserPlus size={40} />}
                title="Create Your Profile"
                description="Design a unique digital card showcasing your personality and interests."
              />
              <FeatureCard 
                icon={<Share2 size={40} />}
                title="Connect with Others"
                description="Discover and interact with like-minded individuals in the Sui ecosystem."
              />
              <FeatureCard 
                icon={<ThumbsUp size={40} />}
                title="Engage and Appreciate"
                description="Like and appreciate other members' cards to build meaningful connections."
              />
            </div>
          </section>

          <section className="text-center py-20">
            <h2 className="text-4xl font-bold mb-4">Ready to Join the Community?</h2>
            <p className="text-xl mb-8">Create your card now and start connecting with others!</p>
            <Button 
              onClick={() => {
                createProfile();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white py-5 text-purple-600 hover:bg-purple-100 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Button>
          </section>

          <footer className="text-center py-8">
            <p>&copy; 2024 Sui Meet. All rights reserved.</p>
          </footer>
          {showChevron && (
            <motion.div 
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, repeat: Infinity, repeatType: 'reverse' }}
            >
              <ChevronDown size={32} />
            </motion.div>
          )}
        </div>
      }
    </div>
  );
}
