"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const RateClassPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId')
  
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/Api/classRating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          rating,
          feedback: feedback.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating')
      }

      setSuccess(true)
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card-box">
            <button
              onClick={() => router.back()}
              className="btn btn-link p-0 mb-4 text-decoration-none d-flex align-items-center gap-2"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            <h2 className="mb-4">Rate This Class</h2>

            {success ? (
              <div className="alert alert-success" role="alert">
                <strong>Thank you!</strong> Your rating has been submitted successfully.
              </div>
            ) : (
              <div>
                {/* Star Rating */}
                <div className="mb-4">
                  <label className="form-label d-block mb-3">
                    <strong>How would you rate this class?</strong>
                  </label>
                  <div className="d-flex gap-2 align-items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn p-0 border-0"
                        style={{ fontSize: '2.5rem', lineHeight: 1 }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <span
                          style={{
                            color: star <= (hoveredRating || rating) ? '#ffc107' : '#dee2e6',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          ★
                        </span>
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ms-3 text-muted">
                        {rating} out of 5
                      </span>
                    )}
                  </div>
                </div>

                {/* Feedback Textarea */}
                <div className="mb-4">
                  <label htmlFor="feedback" className="form-label">
                    <strong>Additional Feedback (Optional)</strong>
                  </label>
                  <textarea
                    id="feedback"
                    className="form-control"
                    rows={5}
                    placeholder="Share your thoughts about the class..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={loading}
                  />
                  <div className="form-text">
                    Help your tutor improve by sharing specific feedback
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={loading || rating === 0}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Rating'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RateClassPage
