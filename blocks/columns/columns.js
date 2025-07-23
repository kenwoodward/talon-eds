export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // For 2-column layouts, combine image and text into same div for text wrapping
  if (cols.length === 2) {
    [...block.children].forEach((row) => {
      const columns = [...row.children];
      if (columns.length === 2) {
        const firstCol = columns[0];
        const secondCol = columns[1];
        
        // Check if first column has image and second has text
        const firstHasImage = firstCol.querySelector('picture');
        const secondHasText = secondCol.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, div:not(:has(picture))');
        
        if (firstHasImage && secondHasText) {
          // Move text content to first column (with image)
          while (secondCol.firstChild) {
            firstCol.appendChild(secondCol.firstChild);
          }
          // Remove the now-empty second column
          secondCol.remove();
          
          // Add class to indicate this is a wrapped layout
          firstCol.classList.add('columns-wrapped-content');
        }
      }
    });
  } else {
    // Original logic for other column counts
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const pic = col.querySelector('picture');
        if (pic) {
          const picWrapper = pic.closest('div');
          if (picWrapper && picWrapper.children.length === 1) {
            // picture is only content in column
            picWrapper.classList.add('columns-img-col');
          }
        }
      });
    });
  }
}
