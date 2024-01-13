import { useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'src/hooks'
import { Navbar, Collapse, Typography, IconButton } from '@material-tailwind/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faBars, faTrophy, faFire, faCircle } from '@fortawesome/free-solid-svg-icons'

const ITEMS: any[] = [
  {
    text: 'Trainer',
    url: '/trainer',
  },
  {
    text: 'Learn',
    url: '/learn',
  },
  {
    text: 'TV',
    url: '/tv',
  },
  {
    text: 'Solver',
    url: '/solver',
  },
  {
    text: 'Offline',
    url: '/offline',
  },
  {
    text: 'Feedback?',
    url: '/feedback',
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
  {
    text: 'Collections',
    url: '/admin/collections',
  },
  {
    text: 'Competitions',
    url: '/admin/competitions',
  },
]

const AppNavbar = ({ admin }: { admin: boolean }) => {
  const [openNav, setOpenNav] = useState(false)
  const location = useLocation()
  const AppNavbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpenNav(false)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openNav && AppNavbarRef.current && !AppNavbarRef.current.contains(e.target as Node)) {
        setOpenNav(false)
      }
    }
    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [openNav])

  useEffect(() => {
    setOpenNav(false)
  }, [location])


  const items = admin ? ADMIN_ITEMS : ITEMS

  const solveCount = useSelector(state => state.userData.solvedPuzzles?.length ?? 0)
  const username = useSelector(state => state.userData.username)
  const userIsAdmin = useSelector(state => state.userData.admin)

  const navList = (
    <ul className="flex flex-col gap-2 mb-2 mt-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-end lg:gap-6">
      {items.map(({ text, url, isNew }) => (
        <Typography
          as="li"
          variant="small"
          className="font-normal hover:text-primary-hover"
          key={url}
        >
          <NavLink
            to={url}
            className={({ isActive }) => isActive ? 'underline' : ''}
          >
            {text}
          </NavLink>
          {isNew && (
            <span className="align-super bg-red-600 text-black text-[10px] font-bold ml-1">NEW</span>
          )}
        </Typography>
      ))}
    </ul>
  )

  const solvedElement = (
    <span>
      Solved: {solveCount}
      {solveCount >= 2 && (
        <>
          {' '}
          {solveCount >= 5 ? (
            <FontAwesomeIcon icon={faTrophy} color={solveCount >= 15 ? 'gold' : solveCount >= 10 ? 'silver' : '#cd7f32'} />
          ) : (
            <span className="fa-layers fa-fw">
              <FontAwesomeIcon icon={faCircle} color="yellow" size="sm" />
              <FontAwesomeIcon icon={faFire} color="red" size="lg" />
            </span>
          )}
        </>
      )}
    </span>
  )

  const rightButtons = (
    <ul className="flex flex-row gap-5 pb-2 lg:pb-0">
      <Typography
        as="li"
        variant="small"
        className="font-normal"
      >
        {solvedElement}
      </Typography>
      {username ? (
        <>
          <Typography
            as="li"
            variant="small"
            className="font-normal hover:text-primary-hover"
          >
            <Link to={userIsAdmin ? '/admin' : '#'}>{username}</Link>
          </Typography>
          <Typography
            as="li"
            variant="small"
            className="font-normal hover:text-primary-hover"
          >
            <Link to="/logout">Sign Out</Link>
          </Typography>
        </>
      ) : (
        <Typography
          as="li"
          variant="small"
          className={classNames('font-normal hover:text-primary-hover', { 'hidden': !admin })}
        >
          <Link to="/login">Sign In</Link>
        </Typography>
      )}
    </ul>
  )

  return (
    <Navbar ref={AppNavbarRef} className="h-13 rounded-none max-w-none py-1 px-4 lg:px-8 border-none uppercase bg-primary">
      <div className="h-full flex items-center justify-between text-primary">
        <Typography
          variant="h3"
          className="mr-6 cursor-pointer font-normal lowercase relative hover:text-primary-hover"
        >
          <Link to={admin ? '/admin' : '/'}>lisudoku</Link>
        </Typography>
        <div className="hidden lg:block grow">{navList}</div>
        <div className="hidden lg:inline-block">{rightButtons}</div>
        <div className="inline-block lg:hidden w-full text-right pr-5">{solvedElement}</div>
        <IconButton
          variant="text"
          className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          ripple={false}
          onClick={() => setOpenNav(!openNav)}
        >
          <FontAwesomeIcon icon={openNav ? faXmark : faBars} size="2x" />
        </IconButton>
      </div>
      <Collapse open={openNav}>
        {navList}
        {rightButtons}
      </Collapse>
    </Navbar>
  )
}

export default AppNavbar
