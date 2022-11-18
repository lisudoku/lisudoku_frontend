const AppFooter = () => (
  <footer className="flex flex-col gap-3 pt-2 pb-5 justify-center items-center">
    <div>© {new Date().getFullYear()} George Mărcuș</div>
    <div>Lisudoku is a free sudoku app. Have fun!</div>
    <div className="flex gap-10">
      <a href="/#" className="text-medium">Play</a>
      <a href="/#" className="text-medium">Learn</a>
      <a href="/#" className="text-medium">Contact</a>
    </div>
  </footer>
)

export default AppFooter
