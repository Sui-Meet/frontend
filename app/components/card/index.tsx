'use client'
import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Plus, GripVertical, X, Upload, Loader2 } from 'lucide-react'
import { Icon } from '@iconify/react'
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { mint } from '@/contract'
import { HexColorPicker } from "react-colorful"
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import type { Transaction } from '@mysten/sui/transactions';


const socialIcons = {
  facebook: 'mdi:facebook',
  twitter: 'mdi:twitter',
  instagram: 'mdi:instagram',
  github: 'mdi:github',
  email: 'mdi:email',
  linkedin: 'mdi:linkedin',
  youtube: 'mdi:youtube',
  whatsApp: 'mdi:whatsapp',
  telegram: 'mdi:telegram',
  wechat: 'mdi:wechat',
};

type FixedSocialLink = {
  icon: string,
  title: string
  link: string
  placeholder: string
}

type CustomLink = {
  id: string
  icon: string
  title: string
  link: string
}

type UploadedBlobInfo = {
  status: string
  blobId: string
  endEpoch: number
  suiRef: string
}

const predefinedColors = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#33FFF5', '#F5FF33',
  '#FF3333', '#33FF33', '#3333FF', '#FFFF33', '#33FFFF', '#FF33FF'
];

export default function Card() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const { toast } = useToast()
  const [iconpicker, setIconpicker] = useState<string | null>(null)
  const [customIcon, setCustomIcon] = useState('')
  const [nickname, setNickname] = useState('')
  const [about, setAbout] = useState('')
  const [avatar, setAvatar] = useState('wnSMTuo7bXMUrqo6knVGb4Bsjmk0ryDrPl2zqwJXb2M')
  const [isLoading, setIsLoading] = useState(false)
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [textColor, setTextColor] = useState('#000000')
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)
  const [fixedSocialLinks, setFixedSocialLinks] = useState<FixedSocialLink[]>([
    { icon: 'mdi:facebook', title: 'Facebook', link: '', placeholder: 'https://www.facebook.com/username' },
    { icon: 'mdi:twitter', title: 'X/Twitter', link: '', placeholder: 'https://x.com/username' },
    { icon: 'mdi:instagram', title: 'Instagram', link: '', placeholder: 'https://www.instagram.com/username' },
    { icon: 'mdi:github', title: 'GitHub', link: '', placeholder: 'https://github.com/username' },
    { icon: 'mdi:linkedin', title: 'LinkedIn', link: '', placeholder: 'https://linkedin.com/in/username' },
    { icon: 'mdi:youtube', title: 'YouTube', link: '', placeholder: 'https://youtube.com/@username' },
    { icon: 'mdi:email', title: 'Email', link: '', placeholder: 'mail@username.com' },
    { icon: 'mdi:whatsapp', title: 'WhatsApp', link: '', placeholder: '+868888888888' },
    { icon: 'mdi:telegram', title: 'Telegram', link: '', placeholder: 'https://t.me/username' },
    { icon: 'mdi:wechat', title: 'Wechat', link: '', placeholder: '' },
  ])
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([])

  const handleFixedLinkChange = (index: number, link: string) => {
    const updatedLinks = [...fixedSocialLinks]
    updatedLinks[index].link = link
    setFixedSocialLinks(updatedLinks)
  }

  const handleCustomLinkChange = (id: string, field: keyof CustomLink, value: string) => {
    setCustomLinks(links => links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
    setIconpicker(null)
  }

  const handleAddCustomLink = () => {
    setCustomLinks([...customLinks, { id: Date.now().toString(), icon: 'mdi:link-variant', title: '', link: '' }])
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(customLinks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setCustomLinks(items)
  }

  const handleDeleteCustomLink = (id: string) => {
    setCustomLinks(links => links.filter(link => link.id !== id))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Please upload image file.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
        // Reset input element to allow selecting the same file again
        event.target.value = ''
        return
      }

      setIsFullScreenLoading(true)

      try {
        const response = await fetch('https://publisher-devnet.walrus.space/v1/store', {
          method: 'PUT',
          body: file
        })

        if (response.status === 200) {
          const info = await response.json()
          console.log(info)

          let blobInfo: UploadedBlobInfo
          if ('alreadyCertified' in info) {
            blobInfo = {
              status: 'Already certified',
              blobId: info.alreadyCertified.blobId,
              endEpoch: info.alreadyCertified.endEpoch,
              suiRef: info.alreadyCertified.event.txDigest,
            }
            setAvatar(blobInfo.blobId)
          } else if ('newlyCreated' in info) {
            blobInfo = {
              status: 'Newly created',
              blobId: info.newlyCreated.blobObject.blobId,
              endEpoch: info.newlyCreated.blobObject.storage.endEpoch,
              suiRef: info.newlyCreated.blobObject.id,
            }
            setAvatar(blobInfo.blobId)
          } else {
            throw new Error("Unexpected response format")
          }
          
        } else {
          throw new Error("Upload failed")
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: error instanceof Error ? error.message : "Upload failed",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
      } finally {
        setIsFullScreenLoading(false)
        // Reset input element to allow selecting the same file again
        event.target.value = ''
      }
    }
  }

  const handleMint = async () => {
    setIsFullScreenLoading(true)
    try {
      const cardData = {
        nickname,
        about,
        avatar,
        backgroundColor,
        textColor,
        fixedSocialLinks: fixedSocialLinks.filter(link => link.link),
        customLinks
      }

      // 上传Walrus
      const response = await fetch('https://publisher-devnet.walrus.space/v1/store', {
        method: 'PUT',
        body: JSON.stringify(cardData)
      })

      if (response.status === 200) {
        const info = await response.json()
        let cardBlobId: string

        if ('alreadyCertified' in info) {
          cardBlobId = info.alreadyCertified.blobId
        } else if ('newlyCreated' in info) {
          cardBlobId = info.newlyCreated.blobObject.blobId
        } else {
          toast({
            variant:"destructive",
            title: "Card minted error!"
          })
          throw new Error("Unexpected response format")
        }
        
        // 上链
        try {
          if (cardBlobId && currentAccount?.address) {
            const tx = await mint(avatar, cardBlobId);
            console.log('test', tx)
            await signAndExecuteTransaction({
              transaction: tx as any,
            }, {
              onSuccess: (result) => {
                toast({
                  className: "bg-green-100 border-green-400 text-green-700",
                  title: "Card minted successfully!",
                  description: "Your card has been successfully minted on the blockchain.",
                })
                console.log("Transaction successful:", result);
                // setTxDigest(result.digest);
                // setIsModalOpen(true);
              },
              onError: (error) => {
                console.error("Transaction failed:", error);
                toast({
                  variant: "destructive",
                  title: "Rejected from you.",
                  action: <ToastAction altText="Try again">Try again</ToastAction>,
                })
              }
            })
          }
        } catch (error) {
          console.error('Error in handleMint:', error);
          toast({
            variant: "destructive",
            title: error instanceof Error ? error.message : "Minting failed",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
        }
      } else {
        toast({
          variant:"destructive",
          title: "Card minted error!"
        })
        throw new Error("Minting failed")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: error instanceof Error ? error.message : "Minting failed",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setIsFullScreenLoading(false)
    }
  }
  
  return (
    <div className="container grid grid-cols-12 divide-x mx-auto min-h-screen z-10 mt-24">
      {isFullScreenLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-white mb-4" />
          <div className="text-white text-xl">
            Loading
            <span className="animate-pulse"> .</span>
            <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
          </div>
        </div>
      )}
      <div className="w-full col-span-4 md:pr-8 lg:pr-8 h-[80vh] overflow-y-auto flex justify-center">
        <motion.div 
          className={`bg-white shadow-lg p-6 h-[80vh] overflow-y-auto w-full`} 
          style={{ backgroundColor: backgroundColor, color: textColor }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-24 h-24 rounded-full mx-auto mb-4 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : avatar ? (
              <motion.img 
                src={`https://aggregator-devnet.walrus.space/v1/${avatar}`} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
                whileHover={{
                  scale: 1.1,
                }}
              />
            ) : (
              <motion.img 
                src={`https://aggregator-devnet.walrus.space/v1/wnSMTuo7bXMUrqo6knVGb4Bsjmk0ryDrPl2zqwJXb2M`} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
                whileHover={{
                  scale: 1.1,
                }}
              />
            )}
          </motion.div>
          <motion.h3 
            className="text-xl font-semibold text-center mb-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {nickname || 'Foo Bar'}
            </motion.span>
          </motion.h3>
          <motion.p 
            className="text-center mb-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {about || 'A Walrus OG.'}
            </motion.span>
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4 py-4 px-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <AnimatePresence>
              {fixedSocialLinks.map(({ icon, link }, index) => {
                if (!link) return null
                return (
                  <motion.a 
                    key={index} 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:scale-110 transition-all duration-500"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon icon={icon} className="w-6 h-6" />
                  </motion.a>
                )
              })}
            </AnimatePresence>
          </motion.div>
          <motion.div 
            className="flex flex-col gap-3 py-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <AnimatePresence>
              {customLinks.map(({ id, icon, title, link }, index) => (
                <motion.a 
                  key={id} 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-sm hover:text-purple-800 bg-gray-100 rounded-full py-3 px-6 transition-all duration-500 hover:scale-105"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon icon={icon} className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-base leading-6 text-gray-900">{title}</span>
                </motion.a>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
      <div className="w-full col-span-8 bg-white h-[80vh] overflow-y-auto">
        <div className="p-8 flex justify-between items-center bg-white transition-shadow duration-300 sticky top-0 z-10" id="stickyHeader">
          <h2 className="text-2xl font-bold text-purple-600">Edit Your Card</h2>
          <button onClick={handleMint} className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x text-white rounded-md hover:scale-105 transition-all duration-300">
            Mint to Meet
          </button>
        </div>
        <div className="space-y-6 p-8">
          <h3 className="text-lg font-semibold mb-2 flex items-center text-purple-600">
            <Icon icon="mdi:information-outline" className="w-4 h-4 mr-2" />
            Basic Information
          </h3>
          <div className='flex flex-col gap-2'>
            <Label htmlFor="nickname" className='flex items-center text-purple-600'>
              <Icon icon="mdi:account" className="w-4 h-4 mr-2" />
              Nickname
            </Label>
            <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="text-purple-600" />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor="about" className='flex items-center text-purple-600'>
              <Icon icon="mdi:card-bulleted-outline" className="w-4 h-4 mr-2" />
              About Me
            </Label>
            <Textarea 
              id="about" 
              value={about} 
              onChange={(e) => setAbout(e.target.value.slice(0, 50))} 
              className="text-purple-600" 
              maxLength={50}
            />
            <span className="text-sm text-gray-500">{about.length}/50</span>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor="avatar" className='flex items-center text-purple-600'>
              <Icon icon="mdi:image" className="w-4 h-4 mr-2" />
              Upload Avatar
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Label
                htmlFor="avatar"
                className="cursor-pointer flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors duration-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Label>
              {avatar && <span className="text-sm text-gray-500">Uploaded！</span>}
            </div>
          </div>
          <div className='flex flex-col gap-3'>
            <Label className='flex items-center text-purple-600'>
              <Icon icon="mdi:palette" className="w-4 h-4 mr-2" />
              Background Color
            </Label>
            <div className="flex items-center gap-2">
              {['#FF5733', '#33FF57', '#3357FF', '#FF33F1', '#33FFF1'].map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`w-8 h-8 rounded-full ${backgroundColor === color ? 'ring-2 ring-offset-2 ring-purple-600' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-8 h-8 p-0 rounded-full">
                    <Icon icon="mdi:plus" className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="flex flex-col gap-2">
                    <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                    <Input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#FFFFFF"
                      className="mt-2"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className='flex flex-col gap-3'>
            <Label className='flex items-center text-purple-600'>
              <Icon icon="mdi:palette" className="w-4 h-4 mr-2" />
              Text Color
            </Label>
            <div className="flex items-center gap-2">
              {['#000000', '#ffffff'].map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={`w-8 h-8 rounded-full border border-gray-300 ${textColor === color ? 'ring-2 ring-offset-2 ring-purple-600' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-8 h-8 p-0 rounded-full">
                    <Icon icon="mdi:plus" className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="flex flex-col gap-2">
                    <HexColorPicker color={textColor} onChange={setTextColor} />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      placeholder="#FFFFFF"
                      className="mt-2"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className='space-y-4 pt-4'>
            <h3 className="text-lg font-semibold mb-2 flex items-center text-purple-600">
              <Icon icon="mdi:link" className="w-4 h-4 mr-2" />
              Social Links
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-2"> 
              {fixedSocialLinks.map(({ icon, title, link, placeholder }, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Icon icon={icon} className="w-4 h-4" />
                    <span className="text-sm font-semibold">{title}</span>
                  </div>
                  <Input
                    value={fixedSocialLinks[index].link}
                    onChange={(e) => handleFixedLinkChange(index, e.target.value)}
                    placeholder={`${placeholder}`}
                    className="w-full text-purple-600"
                  />
                </div>
              ))}
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <h3 className="text-lg pt-4 font-semibold mb-2 flex items-center text-purple-600">
                <Icon icon="mdi:link" className="w-4 h-4 mr-2" />
              Custom Links
              </h3>
              <Droppable droppableId="customLinks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {customLinks.map((link, index) => (
                      <Draggable key={link.id} draggableId={link.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-2 bg-white p-2 rounded shadow group relative"
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="text-purple-600" />
                            </div>
                            <Popover open={iconpicker === link.id} onOpenChange={(open) => setIconpicker(open ? link.id : null)}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-20 p-0 text-purple-600 hover:bg-purple-100 transition-all duration-300">
                                  <Icon icon={link.icon} className='w-4 h-4' />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64">
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                  {Object.entries(socialIcons).map(([key, icon]) => (
                                    <Button
                                      key={key}
                                      variant="outline"
                                      className="p-2 text-purple-600 hover:bg-purple-100 transition-all duration-300"
                                      onClick={() => handleCustomLinkChange(link.id, 'icon', icon)}
                                    >
                                      <Icon icon={icon} width={20} height={20} />
                                    </Button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={customIcon}
                                    onChange={(e) => setCustomIcon(e.target.value)}
                                    placeholder="Enter custom icon name"
                                    className="flex-1 text-purple-600"
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={() => handleCustomLinkChange(link.id, 'icon', customIcon)}
                                    className="text-purple-600 hover:bg-purple-100 transition-all duration-300"
                                  >
                                    Use Custom
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Input
                              value={link.title}
                              onChange={(e) => handleCustomLinkChange(link.id, 'title', e.target.value)}
                              placeholder="Title"
                              className="text-purple-600"
                              maxLength={25}
                            />
                            <Input
                              value={link.link}
                              onChange={(e) => handleCustomLinkChange(link.id, 'link', e.target.value)}
                              placeholder="Link"
                              className="text-purple-600"
                            />
                            <div className="w-8 h-8 flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCustomLink(link.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 hover:bg-purple-100 transition-all duration-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button onClick={handleAddCustomLink} className="w-full mt-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x text-white hover:scale-105 transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" /> Add Custom Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}