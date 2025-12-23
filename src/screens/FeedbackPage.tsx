import { useCallback, useState } from 'react'
import Button from 'src/design_system/Button'
import PageMeta from 'src/components/PageMeta'
import Textarea from 'src/design_system/Textarea'
import ErrorPage from 'src/components/ErrorPage'
import { honeybadger } from 'src/components/HoneybadgerProvider'
import { useSelector } from 'src/hooks'
import Input from 'src/design_system/Input'
import { alert } from 'src/design_system/ConfirmationDialog'

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isOnline = useSelector(state => state.misc.isOnline)

  const handleSubmit = useCallback(() => {
    setSubmitting(true)
    honeybadger.notifyAsync({
      name: 'Feedback',
      context: {
        feedback,
        email,
      }
    }).then(() => {
      setFeedback('')
      setTimeout(() => {
        alert('Thank you for your feedback! You can also join the Discord server. Check the link in the footer.')
      })
    }).catch(() => {
      alert('There was an error while submitting your feedback. Please try again.')
    }).finally(() => {
      setSubmitting(false)
    })
  }, [feedback, email])

  return (
    <div className="px-4 py-3">
      <PageMeta title="Feedback"
                url="https://lisudoku.xyz/feedback"
                description="Send any feedback :)" />
      {isOnline ? (
        <div className="flex flex-col gap-3">
          <Input
            label="Email (optional, only if you want a response)"
            color="white"
            value={email}
            onChange={(value: string) => setEmail(value)}
          />
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
        </div>
      ) : (
        <ErrorPage>
          You can't submit feedback while offline
        </ErrorPage>
      )}
    </div>
  )
}

export default FeedbackPage
