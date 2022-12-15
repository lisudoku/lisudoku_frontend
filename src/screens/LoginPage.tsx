import { Link, useNavigate } from 'react-router-dom'
import { Form, Field } from 'react-final-form'
import { FORM_ERROR } from 'final-form'
import { login, LoginData } from 'src/utils/apiService'
import Button from 'src/components/Button'
import { Typography } from '@material-tailwind/react'
import { loginSuccess } from 'src/reducers/userData'
import { useDispatch } from 'src/hooks'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (values: Record<string, any>) => {
    const result = await login(values as LoginData)

    if (result.error) {
      return { [FORM_ERROR]: result.error }
    }

    dispatch(loginSuccess(result.user))

    navigate('/')
  }

  return (
    <div className="container mx-auto w-full lg:w-1/3 md:w-1/2 my-8 bg-gray-900 py-4 px-8 border border-gray-800 rounded">
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit, submitError, submitting, values }) => (
          <>
            <Typography
              variant="h1"
              className="text-center font-medium"
            >
              Login
            </Typography>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-lg font-medium">Username or email</label>
                <Field
                  id="username"
                  name="username"
                  component="input"
                  autoComplete="username"
                  className="w-full bg-gray-700 border border-gray-500 p-2 rounded outline-1 outline-gray-600 focus:outline-gray-600"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-lg font-medium">Password</label>
                <Field
                  id="password"
                  name="password"
                  component="input"
                  type="password"
                  autoComplete="password"
                  className="w-full bg-gray-700 border border-gray-500 p-2 rounded outline-1 outline-gray-600 focus:outline-gray-600"
                />
              </div>

              <div>
                {submitError && <div className="text-red-600">{submitError}</div>}
                <div className="w-full flex justify-center">
                  <Button
                    type="submit"
                    disabled={submitting || values.username === undefined || values.password === undefined}
                    className="w-full h-12 mt-2 py-1 px-8 bg-gray-800 text-white rounded text-lg shadow-none hover:shadow-sm"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      />
      <div className="hidden flex mt-8 justify-center">
        <h2 className="text-lg">
          <span className="mr-1">
            Don't have an account?
          </span>
          <Link to="/register" className="underline">
            Create A New Account
          </Link>
        </h2>
      </div>
    </div>
  )
}

export default LoginPage
