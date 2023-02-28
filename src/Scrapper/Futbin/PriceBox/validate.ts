/* eslint-disable func-style */
import type { Element, ElementContent, Text, Node } from 'hast'

export function validateElement(
  element: ElementContent,
  name: string
): asserts element is Element {
  if (element.type !== 'element') {
    throw new Error(
      `${name}: expected element but got ${element.type}: ${element}`
    )
  }
}
export function validateText(
  node: ElementContent | Node,
  name: string
): asserts node is Text {
  if (node?.type !== 'text') {
    throw new Error(`${name}: expected element but got ${node?.type}: ${node}`)
  }
}
export function validateAnchor(
  element: ElementContent,
  name: string
): asserts element is Element & { tagName: 'a' } {
  if (element.type !== 'element' || element.tagName !== 'a') {
    throw new Error(
      `${name}: expected element but got ${element.type}: ${element}`
    )
  }
}

export function validateElementClassNames(
  node: Node,
  name: string
): asserts node is Element & {
  properties: { className: string[] }
} {
  if (node?.type !== 'element') {
    throw new Error(`${name}: expected node but got ${node?.type}: ${node}`)
  }
  const element = node as Element
  if (
    !element?.properties?.className ||
    !Array.isArray(element?.properties?.className)
  ) {
    throw new Error(`${name}: expected node but got ${node?.type}: ${node}`)
  }
}
