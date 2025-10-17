'use client'

import { useEffect, useRef, useState } from 'react'
// import { useRouter } from 'next/navigation' // Temporarily disabled
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/ui/Logo'
import { StepHeader } from '@/components/demo/StepHeader'
import { FeatureList } from '@/components/demo/FeatureList'
import { BusinessCard, Business } from '@/components/demo/BusinessCard'
import { AnimatedTrainingFlow } from '@/components/demo/AnimatedTrainingFlow'
import { VoicePlayer } from '@/components/demo/VoicePlayer'
import { Search, MapPin, Clock, GraduationCap, Speaker, Trophy, Check, Phone } from 'lucide-react'
import { searchPlaces, createDemoSession, confirmDemo, startVoiceCall } from '@/lib/api'
// import { loginWithGoogle, loginWithEmail } from '@/lib/auth' // Temporarily disabled
import { DemoFormData } from '@/types/demo'

export default function DemoPage() {
  // const router = useRouter() // Temporarily disabled
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<DemoFormData>({
    businessName: '',
    googleMapsUrl: '',
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    consent: false,
    useFirecrawl: true,
  })
  
  const [searchResults, setSearchResults] = useState<Business[]>([])
  const [suggestions, setSuggestions] = useState<Business[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const [sessionId, setSessionId] = useState<string | null>(null) // Temporarily disabled
  const buildStartedRef = useRef(false)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = async () => {
    if (!formData.businessName.trim()) {
      setError('Please enter a business name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await searchPlaces(
        formData.businessName
      )
      setSearchResults(results)
      // Preselect the first result to streamline Step 2 UX
      if (results.length > 0) {
        setSelectedBusiness(results[0])
      }
      if (results.length > 0) {
        setCurrentStep(2)
      } else {
        setError('No businesses found. Please try a different search term.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business)
    setShowSuggestions(false)
    // reset builder guard so entering step 3 will trigger build once
    buildStartedRef.current = false
    setCurrentStep(3) // Step 3: Building view
  }

  const handleSuggestionPick = (business: Business) => {
    // Step 1 suggestion click should go to Step 2 (confirmation), not Step 3
    setSelectedBusiness(business)
    setShowSuggestions(false)
    setCurrentStep(2)
  }

  // Debounced inline search suggestions on Step 1
  useEffect(() => {
    const q = formData.businessName.trim()
    if (!q || currentStep !== 1) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true)
        const results = await searchPlaces(q)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (e) {
        // swallow errors in suggestions
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsSearching(false)
      }
    }, 350)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.businessName, currentStep])

  // Start build flow when entering Step 3
  useEffect(() => {
    const run = async () => {
      if (currentStep !== 3 || !selectedBusiness || buildStartedRef.current) return
      buildStartedRef.current = true
      setIsLoading(true)
      setError(null)
      try {
        const session = await createDemoSession('retell')
        // setSessionId(session.id) // Temporarily disabled
        try { localStorage.setItem('funnder_session_id', session.id) } catch {}
        await confirmDemo(
          session.id,
          selectedBusiness.place_id,
          {
            name: formData.visitorName,
            email: formData.visitorEmail,
            phoneE164: formData.visitorPhone || '+10000000000',
            consent: true,
          },
          { useFirecrawl: formData.useFirecrawl }
        )
        try {
          await startVoiceCall(session.id, formData.visitorPhone || '+10000000000')
        } catch (_) {
          // Non-fatal in development (e.g., Turnstile missing). Proceed to preview.
        }
        setCurrentStep(4) // move to Preview once built
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to build demo')
        // Stay on step 3 to show the error instead of bouncing back
        setCurrentStep(3)
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [currentStep, selectedBusiness, formData.visitorName, formData.visitorEmail, formData.visitorPhone, formData.useFirecrawl])

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const renderStep1 = () => (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Left Section - Instructions */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
            Train Funnder with your
          </h1>
          <h2 className="text-4xl font-bold text-brand-teal-100 leading-tight tracking-tight">
            Google Business Profile
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Let our AI learn from your business information to create a personalized voice agent.
          </p>
        </div>
        
        <FeatureList
          features={[
            {
              icon: <Search className="w-6 h-6" />,
              text: 'Find your profile by entering your business name.'
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              text: 'Your AI agent will be trained on your Google profile.'
            },
            {
              icon: <Clock className="w-6 h-6" />,
              text: 'Takes less than a minute!'
            }
          ]}
        />

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium text-sm">
              Start risk-free: 7-day trial with all features
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Find your Google Business Profile
          </h3>
          <p className="text-gray-600">
            Search for your business to get started
          </p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Type your business name..."
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            icon={<Search className="w-5 h-5" />}
          />

          {/* Autocomplete suggestions */}
          {showSuggestions && (
            <div className="relative">
              <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-card-lg border border-gray-100 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => handleSuggestionPick(s)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start space-x-3"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{s.name}</div>
                      <div className="text-sm text-gray-600 truncate">{s.address}</div>
                    </div>
                  </button>
                ))}
                <div className="px-4 py-2 border-t border-gray-100 text-right">
                  <span className="text-[10px] text-gray-400">powered by Google</span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {(isLoading || isSearching) ? 'Searching...' : 'Continue →'}
          </Button>

          <p className="text-center text-gray-600 text-sm">
            Use my website instead
          </p>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Left Section - Content (match reference structure) */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
            Train Funnder with your
          </h1>
          <h2 className="text-4xl font-bold text-brand-teal-100 leading-tight tracking-tight">
            Google Business Profile
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Confirm this is your business and we&apos;ll start training your AI agent.
          </p>
        </div>

        <FeatureList
          features={[
            {
              icon: <Search className="w-6 h-6" />,
              text: 'Find your profile by entering your business name.'
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              text: 'Your AI agent will be trained on your Google profile.'
            },
            {
              icon: <Clock className="w-6 h-6" />,
              text: 'Takes less than a minute!'
            }
          ]}
        />

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-brand-teal-100" />
            <span className="text-gray-700 font-medium text-sm">
              Start risk-free: 7-day trial with all features
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - Featured Selection + CTA */}
      <div className="flex flex-col justify-center space-y-6">
        {/* Featured selected business card */}
        {selectedBusiness && (
          <div className="card p-6 flex items-start space-x-4 border border-gray-200">
            {/* Image placeholder */}
            <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
              <MapPin className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-lg truncate">
                {selectedBusiness.name}
              </div>
              <div className="mt-2 flex items-start space-x-2 text-gray-700">
                <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                <p className="text-sm leading-snug truncate">
                  {selectedBusiness.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirm button */}
        <Button
          onClick={() => selectedBusiness && handleBusinessSelect(selectedBusiness)}
          className="w-full"
          size="lg"
        >
          Yes, Train Funnder ✨
        </Button>

        {/* Search again link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Search again
          </button>
        </div>

        {/* Alternate choices list */}
        {searchResults.length > 1 && (
          <div className="space-y-2">
            {searchResults.slice(1).map((business) => (
              <BusinessCard
                key={business.place_id}
                business={business}
                isSelected={selectedBusiness?.place_id === business.place_id}
                onSelect={setSelectedBusiness}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <AnimatedTrainingFlow 
      onComplete={() => setCurrentStep(4)}
      businessName={selectedBusiness?.name}
      websiteUrl={selectedBusiness?.website}
    />
  )

  const renderStep4 = () => (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Left - Preview */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
            <span className="text-brand-teal-100">Preview</span> {selectedBusiness?.name}&apos;s Custom Agent
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Listen to how your AI agent will sound when answering customer calls.
          </p>
        </div>
        <FeatureList
          features={[
            { icon: <GraduationCap className="w-6 h-6" />, text: 'Funnder has been trained on your data.' },
            { icon: <Speaker className="w-6 h-6" />, text: 'Listen to the examples to hear your agent.' },
            { icon: <Trophy className="w-6 h-6" />, text: 'Claim your agent and get started for free.' },
          ]}
        />
      </div>

      {/* Right - Samples & CTA */}
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Listen to a few examples below&hellip;</h3>
          <p className="text-gray-600">Click the play buttons to hear your AI agent in action</p>
        </div>
        <div className="space-y-3">
          <VoicePlayer
            title="Greeting"
            text=""
            voiceType="greeting"
            businessName={selectedBusiness?.name}
          />
          <VoicePlayer
            title="Message"
            text=""
            voiceType="message"
            businessName={selectedBusiness?.name}
          />
        </div>
        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={() => setCurrentStep(5)}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return (
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                  <span className="text-brand-teal-100">Claim</span> {selectedBusiness?.name}&apos;s Custom Agent
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Your AI agent is ready! Create your account to start using Funnder for your business.
                </p>
              </div>
              <FeatureList
                features={[
                  { icon: <Phone className="w-6 h-6" />, text: 'Grow your business while Funnder answers calls 24/7.' },
                  { icon: <Clock className="w-6 h-6" />, text: '7-day trial with all features.' },
                  { icon: <Check className="w-6 h-6" />, text: 'Our support team is here for you and ready to help.' },
                ]}
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">Create Your Account</h3>
                <p className="text-xl text-gray-600">Free for 7 days, then $99/month</p>
              </div>
              <Button className="w-full" size="lg">Continue with Google</Button>
              <div className="text-center text-gray-400">or</div>
              <Button className="w-full" variant="outline" size="lg">Continue with Email</Button>
            </div>
          </div>
        )
      default:
        return renderStep1()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-4">
            <Logo />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-5xl" padding="lg">
          <StepHeader
            currentStep={currentStep}
            totalSteps={5}
            onBack={currentStep > 1 ? handleBack : undefined}
          />

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {renderCurrentStep()}
        </Card>
      </div>

      {/* Chat Support Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-12 h-12 bg-brand-teal-100 rounded-full flex items-center justify-center shadow-lg hover:bg-brand-teal-200 transition-colors duration-200">
          <div className="w-6 h-6 text-white">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5l3 3v-3c1.66 0 3-1.34 3-3s-1.34-3-3-3v-3c1.66 0 3-1.34 3-3s-1.34-3-3-3h-5c-4.41 0-8 3.59-8 8s3.59 8 8 8h1v2c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7v2h-1c-2.76 0-5-2.24-5-5s2.24-5 5-5h5c1.1 0 2 .9 2 2s-.9 2-2 2h-5c-1.66 0-3 1.34-3 3s1.34 3 3 3h1v2h-1c-2.76 0-5-2.24-5-5s2.24-5 5-5h5c1.1 0 2 .9 2 2s-.9 2-2 2h-5c-1.66 0-3 1.34-3 3s1.34 3 3 3h1v2h-1c-2.76 0-5-2.24-5-5s2.24-5 5-5z"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}
