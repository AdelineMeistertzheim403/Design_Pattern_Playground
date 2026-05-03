// Fallback layout UML: organise les boites en rangees basees sur leurs positions.

function withPosition(box, x, y) {
  return {
    ...box,
    x,
    y,
  }
}

function getRowWidth(boxes, gap) {
  return boxes.reduce((total, box, index) => total + box.width + (index > 0 ? gap : 0), 0)
}

function getRowHeight(boxes) {
  return Math.max(...boxes.map((box) => box.height))
}

export function buildFallbackLayout(boxes) {
  const marginX = 88
  const marginY = 74
  const columnGap = 102
  const rowGap = 94
  const sortedBoxes = [...boxes].sort((left, right) => (
    left.y === right.y
      ? left.x - right.x
      : left.y - right.y
  ))
  const rows = []

  sortedBoxes.forEach((box) => {
    const lastRow = rows[rows.length - 1]

    if (!lastRow || Math.abs(lastRow.referenceY - box.y) > 120) {
      rows.push({ referenceY: box.y, boxes: [box] })
      return
    }

    lastRow.boxes.push(box)
  })

  const rowWidths = rows.map((row) => getRowWidth(row.boxes, columnGap))
  const width = marginX * 2 + Math.max(...rowWidths)
  let cursorY = marginY
  const positionedBoxes = []

  rows.forEach((row, rowIndex) => {
    const rowWidth = rowWidths[rowIndex]
    const rowStartX = marginX + (width - marginX * 2 - rowWidth) / 2
    let cursorX = rowStartX
    const rowHeight = getRowHeight(row.boxes)

    row.boxes.forEach((box) => {
      positionedBoxes.push(withPosition(box, cursorX, cursorY + (rowHeight - box.height) / 2))
      cursorX += box.width + columnGap
    })

    cursorY += rowHeight + rowGap
  })

  return {
    viewBox: `0 0 ${width} ${cursorY - rowGap + marginY}`,
    boxes: positionedBoxes,
  }
}
