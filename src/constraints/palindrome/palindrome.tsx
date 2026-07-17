import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons'
import type { CellErrorSet, ConstraintDefinition } from '../types'
import { SudokuVariant } from 'src/types/sudoku'
import { palindromeGraphics } from './graphics'
import { CellValueComparatorNotEqual, ensureTargetArray, expandsArea8, getErrorSetsBetween, removeConstraintFromArray } from '../utils'
import { find, isEqual } from 'lodash-es'

export const palindromeConstraint: ConstraintDefinition = {
  icon: <FontAwesomeIcon icon={faArrowsLeftRight} size="sm" title="Palindrome" />,
  label: 'Palindrome',
  description: () => 'Digits along any gray line form a palindrome (they read the same in both directions).',
  isGlobal: false,
  isActiveInConstraints: ({ constraints }) => (constraints.palindromes ?? []).length > 0,
  variant: () => SudokuVariant.Palindrome,
  graphics: palindromeGraphics,
  cellPeers: ({ constraints, cell }) => {
    const palindromePeers = []
    for (const palindrome of constraints.palindromes ?? []) {
      const index = palindrome.findIndex(pCell => isEqual(pCell, cell))
      if (index !== -1 && 2 * index + 1 !== palindrome.length) {
        palindromePeers.push(palindrome[palindrome.length - 1 - index])
      }
    }
    return palindromePeers
  },
  errors: ({ constraints, valuesGrid, cellMarksGrid }) => {
    const errorSets: CellErrorSet[] = []

    for (const palindrome of constraints.palindromes ?? []) {
      let left = 0
      let right = palindrome.length - 1
      while (left < right) {
        const leftCell = palindrome[left]
        const rightCell = palindrome[right]

        const currentErrorSets = getErrorSetsBetween(
          leftCell, rightCell, CellValueComparatorNotEqual,
          valuesGrid, cellMarksGrid,
        )

        errorSets.push(...currentErrorSets)

        left += 1
        right -= 1
      }
    }

    return errorSets
  },
  removeConstraintsAtCell: ({ constraints, isSelectedCell }) => {
    removeConstraintFromArray(constraints.palindromes, isSelectedCell)
  },
  expandCurrentConstraintAtCell: ({ constraints, cell, editorState }) => {
    constraints.palindromes ??= []
    const currentPalindrome = ensureTargetArray(constraints.palindromes, editorState)

    if (
      currentPalindrome.length === 0 ||
      !find(currentPalindrome, cell) &&
      expandsArea8(currentPalindrome, cell)
    ) {
      currentPalindrome.push(cell)
      return true
    }

    return false
  },
  validateCurrentConstraint: ({ constraints, editorState }) => {
    if (editorState.targetIndex === undefined || constraints.palindromes === undefined) {
      return {
        type: 'info',
        message: 'Click on a cell to start a palindrome line.',
      }
    }

    const currentPalindrome = constraints.palindromes[editorState.targetIndex]

    if (currentPalindrome.length === 0) {
      return {
        type: 'info',
        message: 'Click on a cell to start a palindrome line.',
      }
    }

    if (currentPalindrome.length === 1) {
      return {
        type: 'error',
        message: 'Palindrome line is too short. Click on other cells to expand it.',
      }
    }

    return {
      type: 'success',
      message: 'Current palindrome is valid',
    }
  },
  prepareCurrentConstraint: () => null,
}
