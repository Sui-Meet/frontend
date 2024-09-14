'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Card from '@/app/components/card'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { motion } from 'framer-motion'
import { Pacifico, Roboto } from 'next/font/google'

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

export default function Home() {
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [typedSlogan, setTypedSlogan] = useState('')
  const [sloganIndex, setSloganIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const currentAccount = useCurrentAccount();
  const [loadedText, setLoadedText] = useState('Sui Meet')

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
    <div className="w-screen min-h-screen bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className='absolute top-8 right-8 z-10'>
        <ConnectButton />
      </div>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      {/* Content */}
      {isFormOpen ? 
        <Card />
        : 
        <div className="absolute text-center overflow-visible">
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
      }
    </div>
  );
}
