'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Step0CycleSelection from './steps/Step0CycleSelection'
import Step1Account from './steps/Step1Account'
import Step2Plant from './steps/Step2Plant'
import Step3Company from './steps/Step3Company'
import Step4Segment from './steps/Step4Segment'
import Step5Enzymes from './steps/Step5Enzymes'
import Step6MarketShare from './steps/Step6MarketShare'
import Step7Review from './steps/Step7Review'
import { validateAllBeforeFinalize } from '@/lib/validations/wizardValidation'

interface WizardData {
  cycleId: string
  businessSegmentId?: string
  accountManagerUserId: string
  plantId?: string | null
  companyId?: string
  countryId?: string
  region?: string
  subregion?: string
  existingCustomer?: 'yes' | 'no'
  goToMarket?: 'direct' | 'distributor'
  distributorId?: string | null
  productionBeerHlYear?: number | null
  segmentId?: string
  productionPercent?: number | null
  confidencePercent?: number | null
  comments?: string
  enzymeValues: Record<string, any>
}

export default function EntryWizard({
  userId,
  entryId,
  existingEntry
}: {
  userId: string
  entryId?: string
  existingEntry?: any
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(isEditMode ? 1 : 0)
  const [loading, setLoading] = useState(false)
  const [cycle, setCycle] = useState<any>(null)
  const isEditMode = !!entryId

  const [wizardData, setWizardData] = useState<WizardData>({
    cycleId: '',
    businessSegmentId: existingEntry?.businessSegmentId || '',
    accountManagerUserId: userId,
    enzymeValues: {},
  })

  // Initialize with existing entry data if editing
  useEffect(() => {
    if (existingEntry) {
      // Convert enzyme values array to Record format
      const enzymeValuesMap: Record<string, any> = {}
      existingEntry.enzymeValues?.forEach((ev: any) => {
        enzymeValuesMap[ev.enzymeCategoryId] = {
          usageStatus: ev.usageStatus,
          penetrationPercent: ev.penetrationPercent,
          iffMarketSharePercent: ev.iffMarketSharePercent,
          novonesisMarketSharePercent: ev.novonesisMarketSharePercent,
          dsmMarketSharePercent: ev.dsmMarketSharePercent,
          othersMarketSharePercent: ev.othersMarketSharePercent,
          confirmed: ev.confirmed,
        }
      })

      setWizardData({
        cycleId: existingEntry.cycleId,
        accountManagerUserId: existingEntry.accountManagerUserId,
        plantId: existingEntry.plantId,
        companyId: existingEntry.companyId,
        countryId: existingEntry.countryId,
        region: existingEntry.region,
        subregion: existingEntry.subregion,
        existingCustomer: existingEntry.existingCustomer,
        goToMarket: existingEntry.goToMarket,
        distributorId: existingEntry.distributorId,
        productionBeerHlYear: existingEntry.productionBeerHlYear,
        segmentId: existingEntry.segmentId,
        productionPercent: existingEntry.productionPercent,
        confidencePercent: existingEntry.confidencePercent,
        comments: existingEntry.comments,
        enzymeValues: enzymeValuesMap,
      })
      setCycle({ id: existingEntry.cycleId })
    }
  }, [existingEntry])

  // Fetch current cycle (only for new entries)
  useEffect(() => {
    if (!isEditMode) {
      fetch('/api/cycles/current')
        .then((res) => res.json())
        .then((data) => {
          setCycle(data)
          setWizardData((prev) => ({ ...prev, cycleId: data.id }))
        })
    }
  }, [isEditMode])

  const updateData = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }))
  }

  const steps = [
    { number: 1, title: 'Account', component: Step1Account },
    { number: 2, title: 'Plant', component: Step2Plant },
    { number: 3, title: 'Company', component: Step3Company },
    { number: 4, title: 'Segment', component: Step4Segment },
    { number: 5, title: 'Enzymes', component: Step5Enzymes },
    { number: 6, title: 'Market Share', component: Step6MarketShare },
    { number: 7, title: 'Review', component: Step7Review },
  ]

  const CurrentStepComponent = steps[currentStep - 1].component

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinalize()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      const url = isEditMode ? `/api/entries/${entryId}` : '/api/entries'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...wizardData, status: 'draft', finalized: false }),
      })

      if (response.ok) {
        alert('Draft saved successfully')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || error.message || 'Failed to save draft'}`)
      }
    } catch (error) {
      alert('Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async () => {
    // Client-side validation before submitting
    const validation = validateAllBeforeFinalize(wizardData)

    if (!validation.isValid) {
      alert(`Please fix the following errors before finalizing:\n\n${validation.errors.join('\n')}`)
      return
    }

    setLoading(true)
    try {
      const url = isEditMode ? `/api/entries/${entryId}` : '/api/entries'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...wizardData, status: 'finalized', finalized: true }),
      })

      if (response.ok) {
        alert('Entry finalized successfully')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        alert(`Validation errors:\n${error.errors?.join('\n') || error.error || error.message || 'Failed to finalize'}`)
      }
    } catch (error) {
      alert('Failed to finalize entry')
    } finally {
      setLoading(false)
    }
  }

  if (!cycle) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Progress Steps */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={() => setCurrentStep(step.number)}
              className={`flex-1 min-w-[100px] px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentStep === step.number
                  ? 'border-blue-500 text-blue-600'
                  : currentStep > step.number
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    currentStep === step.number
                      ? 'bg-blue-100 text-blue-600'
                      : currentStep > step.number
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.number}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Step Content */}
      <div className="p-6 min-h-[400px]">
        <CurrentStepComponent
          data={wizardData}
          updateData={updateData}
          cycle={cycle}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {currentStep === 7 ? 'Finalize Entry' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
