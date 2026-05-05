"use client"

import { useState, useEffect } from "react"
import { UserProfile } from "./components/user-profile"
import { Recommendations } from "./components/recommendations"
import { WelcomeLoader } from "./components/welcome-loader"
import { BookOpen, User, Award, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

interface UserProfileData {
  interests: string
  performance: string
  careerAspirations: string
  skillBuildingNeeds: string
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    interests: "",
    performance: "",
    careerAspirations: "",
    skillBuildingNeeds: "",
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    // Set loaded state after initial animations
    const timer = setTimeout(() => setIsLoaded(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  const handleProfileUpdate = (data: UserProfileData) => {
    setUserProfile(data)
    // Smoothly transition to recommendations tab after profile update
    setTimeout(() => {
      setActiveTab("recommendations")
    }, 300)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 2.2,
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <>
      <WelcomeLoader />
      <motion.div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.header
          className="border-b sticky top-0 z-10 backdrop-blur-md shadow-sm"
          variants={itemVariants}
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
          }}
        >
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg mr-3 shadow-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                  Learning Dashboard
                </span>
              </h1>
              <div className="flex items-center space-x-1 text-sm bg-blue-50 px-3 py-1 rounded-full text-blue-700 border border-blue-100">
                <Sparkles className="h-4 w-4 text-blue-500 mr-1" />
                <span>Public Access</span>
              </div>
            </div>
          </div>
        </motion.header>
        <motion.main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8" variants={itemVariants}>
          <div className="px-4 py-6 sm:px-0">
            <motion.div variants={itemVariants}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 p-1 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 shadow-inner">
                  <TabsTrigger
                    value="profile"
                    className="flex items-center justify-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Your Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="recommendations"
                    className="flex items-center justify-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Recommendations
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-6">
                  <UserProfile onProfileUpdate={handleProfileUpdate} />
                </TabsContent>
                <TabsContent value="recommendations" className="mt-6">
                  <Recommendations profileData={userProfile} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </motion.main>
        <footer className="py-6 text-center text-sm text-blue-600 border-t border-blue-100 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Learning Journey Platform • Powered by AI</p>
          </div>
        </footer>
      </motion.div>
    </>
  )
}
