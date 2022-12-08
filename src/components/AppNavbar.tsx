import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, MobileNav, Typography, IconButton } from '@material-tailwind/react'
import { userToken, userName } from 'src/utils/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faBars } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'src/hooks'

const ITEMS = [
  {
    text: 'Learn',
    url: '/learn',
  },
  // {
  //   text: 'Live',
  //   url: '/tv',
  // },
]

const ADMIN_ITEMS = [
  {
    text: 'Play',
    url: '/',
  },
  {
    text: 'Counts',
    url: '/admin/group_counts',
  },
  {
    text: 'Puzzles',
    url: '/admin/puzzles',
  },
  {
    text: 'Build',
    url: '/admin/build',
  },
]

const AppNavbar = ({ admin }: { admin: boolean }) => {
  const [openNav, setOpenNav] = useState(false)

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpenNav(false)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const items = admin ? ADMIN_ITEMS : ITEMS

  const solveCount = useSelector(state => state.userData.solvedPuzzleIds.length)

  const navList = (
    <ul className="flex flex-col gap-2 mb-2 mt-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-end lg:gap-6">
      {items.map(({ text, url }) => (
        <Typography
          as="li"
          variant="small"
          color="white"
          className="font-normal"
          key={url}
        >
          <Link to={url}>{text}</Link>
        </Typography>
      ))}
    </ul>
  )

  const rightButtons = (
    <ul className="flex flex-col gap-2 pb-2 lg:pb-0">
      <Typography
        as="li"
        variant="small"
        color="white"
        className="font-normal"
      >
        <div>Solved: {solveCount}</div>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="white"
        className="font-normal hidden"
      >
        <Link to="#">Sign In</Link>
      </Typography>
    </ul>
  )

  return (
    <Navbar className="h-13 rounded-none max-w-none py-1 px-4 lg:px-8 bg-gradient-to-b from-gray-700 to-gray-900 border-none uppercase">
      <div className="h-full flex items-center justify-between text-white">
        <Typography
          variant="h3"
          className="mr-6 cursor-pointer font-normal lowercase relative"
        >
          <Link to={admin ? '/admin' : '/'}>lisudoku</Link>
        </Typography>
        <div className="hidden lg:block grow">{navList}</div>
        <div className="hidden lg:inline-block">{rightButtons}</div>
        <IconButton
          variant="text"
          className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          ripple={false}
          onClick={() => setOpenNav(!openNav)}
        >
          <FontAwesomeIcon icon={openNav ? faXmark : faBars} size="2x" />
        </IconButton>
      </div>
      <MobileNav open={openNav}>
        {navList}
        {rightButtons}
      </MobileNav>
    </Navbar>
  )
}

export default AppNavbar
