import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import { useSelector } from 'src/hooks'
import { Navbar, MobileNav, Typography, IconButton } from '@material-tailwind/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faBars } from '@fortawesome/free-solid-svg-icons'

const ITEMS: any[] = [
  // {
  //   text: 'Learn',
  //   url: '/learn',
  // },
  {
    text: 'TV',
    url: '/tv',
  },
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

  const solveCount = useSelector(state => state.userData.solvedPuzzles?.length ?? 0)
  const username = useSelector(state => state.userData.username)
  const userIsAdmin = useSelector(state => state.userData.admin)

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
    <ul className="flex flex-row gap-5 pb-2 lg:pb-0">
      <Typography
        as="li"
        variant="small"
        color="white"
        className="font-normal"
      >
        Solved: {solveCount}
      </Typography>
      {username ? (
        <>
          <Typography
            as="li"
            variant="small"
            color="white"
            className="font-normal"
          >
            <Link to={userIsAdmin ? '/admin' : '#'}>{username}</Link>
          </Typography>
          <Typography
            as="li"
            variant="small"
            color="white"
            className="font-normal"
          >
            <Link to="/logout">Sign Out</Link>
          </Typography>
        </>
      ) : (
        <Typography
          as="li"
          variant="small"
          color="white"
          className={classNames('font-normal', { 'hidden': !admin })}
        >
          <Link to="/login">Sign In</Link>
        </Typography>
      )}
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
