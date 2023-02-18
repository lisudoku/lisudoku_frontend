import PageMeta from 'src/components/PageMeta'
import { Typography } from '@material-tailwind/react'

const AboutPage = () => (
  <>
    <PageMeta title="About lisudoku"
              url="https://lisudoku.xyz/about"
              description="Contact information, how to contribute" />
    <div className="p-3">
      <Typography variant="h3">
        Contact
      </Typography>
      <Typography variant="paragraph">
        For any questions you can join the {' '}
        <a href="https://discord.gg/SGV8TQVSeT"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400">
          Discord server
        </a>.
      </Typography>
      <Typography variant="h3" className="mt-5">
        Source Code
      </Typography>
      <Typography variant="paragraph">
        Lisudoku is a free sudoku app. The source code is open for everyone to read and use.
      </Typography>
      <Typography variant="paragraph">
        You can find it here {' '}
        <a href="https://github.com/orgs/lisudoku/repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400">
          https://github.com/orgs/lisudoku/repositories
        </a>.
      </Typography>
      <Typography variant="paragraph">
        The stack is
      </Typography>
      <ul className="list-disc list-inside">
        <li className="font-light">Backend - Ruby on Rails</li>
        <li className="font-light">Frontend - React</li>
        <li className="font-light">Solver - Rust</li>
      </ul>
      <Typography variant="paragraph" className="mt-5">
        Contributions are welcome! You can contribute by writing code, providing UI designs, or 
        any idea that can improve lisudoku.
      </Typography>
    </div>
  </>
)

export default AboutPage
