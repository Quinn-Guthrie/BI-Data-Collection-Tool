'use client'

import { useState, useRef } from 'react'

type UploadResult = {
  success: boolean
  results?: {
    success: number
    skipped: number
    errors: string[]
  }
  message?: string
  error?: string
}

export default function FileUpload() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setResult({
        success: false,
        error: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)',
      })
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="text-6xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your CSV or Excel file here
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
          </div>
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? 'Uploading...' : 'Select File'}
          </button>
          <p className="text-xs text-gray-400">
            Supported formats: CSV, XLSX, XLS
          </p>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div
          className={`rounded-lg p-6 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          {result.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <h3 className="text-lg font-semibold text-green-900">
                  {result.message}
                </h3>
              </div>

              {result.results && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded p-3">
                      <p className="text-gray-600">Successfully Created</p>
                      <p className="text-2xl font-bold text-green-600">
                        {result.results.success}
                      </p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="text-gray-600">Skipped</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {result.results.skipped}
                      </p>
                    </div>
                  </div>

                  {result.results.errors.length > 0 && (
                    <div className="bg-white rounded p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Errors ({result.results.errors.length})
                      </h4>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {result.results.errors.map((error, idx) => (
                          <p key={idx} className="text-sm text-red-600">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Upload Failed</h3>
                <p className="text-sm text-red-700 mt-1">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">File Format Instructions</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>Your CSV/Excel file should include the following columns:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Required:</strong> Company, Country, Segment</li>
            <li><strong>Optional:</strong> Plant, Distributor, Existing Customer, Go To Market</li>
            <li><strong>Optional:</strong> Production (HL/year), Production %, Confidence %, Comments</li>
            <li><strong>Enzymes:</strong> [Enzyme Name] Penetration, [Enzyme Name] IFF %, etc.</li>
          </ul>
          <p className="mt-3">
            <strong>Note:</strong> Duplicate entries (same Company + Country + Segment + Plant in current cycle) will be skipped.
          </p>
        </div>
      </div>
    </div>
  )
}
