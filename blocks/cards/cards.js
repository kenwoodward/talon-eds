import { createOptimizedPicture } from '../../scripts/aem.js';

function truncateText(text, maxLength = 150) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function truncateHtmlContent(element, maxLength = 175) {
  // Get all text nodes in the element
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let totalLength = 0;
  const textNodes = [];
  let node;

  // Collect all text nodes and their lengths
  while (node = walker.nextNode()) {
    textNodes.push(node);
    totalLength += node.textContent.length;
  }

  // If total length is within limit, no need to truncate
  if (totalLength <= maxLength) return;

  // Truncate text nodes to fit within the limit
  let remainingLength = maxLength;
  for (const textNode of textNodes) {
    const nodeLength = textNode.textContent.length;
    if (remainingLength <= 0) {
      textNode.textContent = '';
      continue;
    }
    
    if (nodeLength <= remainingLength) {
      remainingLength -= nodeLength;
    } else {
      // This node needs to be truncated
      const truncatedText = textNode.textContent.substring(0, remainingLength).trim();
      textNode.textContent = truncatedText + '...';
      remainingLength = 0;
    }
  }
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else {
        div.className = 'cards-card-body';
        // Truncate text content to 150 characters while preserving HTML
        truncateHtmlContent(div, 150);
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
