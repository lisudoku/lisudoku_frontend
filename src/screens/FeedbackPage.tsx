import { useCallback, useState } from 'react'
import Button from 'src/components/Button'
import PageMeta from 'src/components/PageMeta'
import Textarea from 'src/components/Textarea'
import { honeybadger } from 'src/components/HoneybadgerProvider'

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(() => {
    setSubmitting(true)
    honeybadger.notifyAsync({
      name: 'Feedback',
      message: feedback,
    }).then(() => {
      setFeedback('')
      setTimeout(() => {
        alert('Thank you for your feedback! You can also join the Discord server. Check the link in the footer.')
      })
    }).finally(() => {
      setSubmitting(false)
    })
  }, [feedback])

  return (
    <>
      <PageMeta title="Feedback"
                url="https://lisudoku.xyz/feedback"
                description="Send any feedback :)" />
      <Textarea
        label="Send any feedback!"
        className="h-52"
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
      />
      <Button
        disabled={feedback.length === 0 || submitting}
        onClick={handleSubmit}
      >
        Send
      </Button>
    </>
  )
}

export default FeedbackPage
