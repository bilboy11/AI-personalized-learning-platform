"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import axios from 'axios'

function getGenAI(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINIAI
  if (!apiKey || !apiKey.trim()) return null
  return new GoogleGenerativeAI(apiKey)
}

interface Recommendation {
  title: string
  type: string
  description: string
  link: string
}

interface UserProfileData {
  interests: string
  performance: string
  careerAspirations: string
  skillBuildingNeeds: string
}

export async function getRecommendations(profileData: UserProfileData): Promise<Recommendation[]> {
  try {
    const genAI = getGenAI()
    if (!genAI) return getDefaultRecommendations(profileData)

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `
      As an AI learning assistant, analyze this student profile and provide 6 specific recommendations:
      3 for academic courses or resources, and 3 for extracurricular activities.
      Return ONLY a JSON array with exactly 6 objects, each containing 'title', 'type', 'description', and 'link'.
      
      Important Rules for Links:
      1. For academic resources, use Google search links in this format:
         "https://www.google.com/search?q=[TOPIC]+online+course+site:coursera.org+OR+site:edx.org+OR+site:khanacademy.org"
      2. For extracurricular activities, use Google search links in this format:
         "https://www.google.com/search?q=[TOPIC]+workshop+OR+event+OR+volunteer"
      3. Replace [TOPIC] with relevant keywords from the recommendation title
      4. NEVER include direct course links (they may expire)
      
      Student Profile:
      Interests: ${profileData.interests}
      Academic Performance: ${profileData.performance}
      Career Aspirations: ${profileData.careerAspirations}
      Skill-building Needs: ${profileData.skillBuildingNeeds}

      Example format:
      [
        {
          "title": "Cybersecurity Fundamentals",
          "type": "Academic",
          "description": "Learn essential cybersecurity concepts and practices",
          "link": "https://www.google.com/search?q=Cybersecurity+Fundamentals+online+course+site:coursera.org+OR+site:edx.org+OR+site:khanacademy.org"
        },
        {
          "title": "Coding Bootcamps",
          "type": "Extracurricular",
          "description": "Find intensive programming workshops in your area",
          "link": "https://www.google.com/search?q=Coding+Bootcamps+workshop+OR+event"
        }
      ]
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Extract JSON from response
    if (text.includes("```")) {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch && jsonMatch[1]) {
        text = jsonMatch[1].trim()
      }
    }

    // Find the JSON array in the response
    const arrayStartIndex = text.indexOf("[")
    const arrayEndIndex = text.lastIndexOf("]") + 1
    if (arrayStartIndex >= 0 && arrayEndIndex > arrayStartIndex) {
      text = text.substring(arrayStartIndex, arrayEndIndex)
    }

    let parsedRecommendations: Recommendation[] = []
    try {
      parsedRecommendations = JSON.parse(text)
    } catch (error) {
      console.error("Failed to parse recommendations:", error)
      return getDefaultRecommendations(profileData)
    }

    // Validate and process recommendations
    const validatedRecommendations = await Promise.all(
      parsedRecommendations.map(async (rec) => {
        // Ensure the link is a Google search link
        let finalLink = rec.link
        if (!rec.link.includes('google.com/search')) {
          finalLink = convertToGoogleSearch(rec.title, rec.type)
        }
        
        // Verify the link is accessible
        const isValid = await validateUrl(finalLink)
        return {
          ...rec,
          link: isValid ? finalLink : convertToGoogleSearch(rec.title, rec.type)
        }
      })
    )

    // Ensure we return exactly 6 recommendations
    if (validatedRecommendations.length >= 6) {
      return validatedRecommendations.slice(0, 6)
    }
    
    // If we got fewer than 6, supplement with defaults
    const defaultRecs = getDefaultRecommendations(profileData)
    return [...validatedRecommendations, ...defaultRecs.slice(0, 6 - validatedRecommendations.length)]

  } catch (error) {
    console.error("Error generating recommendations:", error)
    return getDefaultRecommendations(profileData)
  }
}

// Convert any title to a Google search link
function convertToGoogleSearch(title: string, type: string): string {
  const encodedQuery = encodeURIComponent(title)
  if (type.toLowerCase().includes('academic')) {
    return `https://www.google.com/search?q=${encodedQuery}+online+course+site:coursera.org+OR+site:edx.org+OR+site:khanacademy.org`
  } else {
    return `https://www.google.com/search?q=${encodedQuery}+workshop+OR+event+OR+volunteer`
  }
}

// Validate URL is accessible
async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 3000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    return response.status >= 200 && response.status < 400
  } catch (error) {
    return false
  }
}

// Default recommendations using Google search
function getDefaultRecommendations(profileData: UserProfileData): Recommendation[] {
  const academicQuery = encodeURIComponent(
    `${profileData.interests} ${profileData.careerAspirations} course`
  )
  const extracurricularQuery = encodeURIComponent(
    `${profileData.interests} ${profileData.skillBuildingNeeds} workshop OR event`
  )

  return [
    {
      title: "Personalized Course Recommendations",
      type: "Academic",
      description: `Find courses matching your interests in ${profileData.interests}`,
      link: `https://www.google.com/search?q=${academicQuery}+site:coursera.org+OR+site:edx.org`
    },
    {
      title: "Career Development Resources",
      type: "Academic",
      description: `Resources to help with your career goals in ${profileData.careerAspirations}`,
      link: `https://www.google.com/search?q=${encodeURIComponent(profileData.careerAspirations)}+career+resources`
    },
    {
      title: "Skill Building Workshops",
      type: "Extracurricular",
      description: `Improve your ${profileData.skillBuildingNeeds} skills through workshops`,
      link: `https://www.google.com/search?q=${encodeURIComponent(profileData.skillBuildingNeeds)}+workshop+OR+training`
    },
    {
      title: "Networking Events",
      type: "Extracurricular",
      description: "Connect with professionals in your field",
      link: `https://www.google.com/search?q=${encodeURIComponent(profileData.careerAspirations)}+networking+event`
    },
    {
      title: "Online Learning Platforms",
      type: "Academic",
      description: "Explore top online learning resources",
      link: "https://www.google.com/search?q=best+online+learning+platforms"
    },
    {
      title: "Volunteer Opportunities",
      type: "Extracurricular",
      description: "Gain experience through volunteering",
      link: `https://www.google.com/search?q=${encodeURIComponent(profileData.interests)}+volunteer+opportunities`
    }
  ]
}
