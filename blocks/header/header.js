import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Recursively processes nested navigation items
 * @param {Element} container The container element to process
 */
function processNestedNav(container) {
  console.log('=== PROCESSING NESTED NAV START ===');
  console.log('Processing container:', container);
  console.log('Container HTML:', container.innerHTML);
  const navItems = container.querySelectorAll('li');
  console.log('Found li elements:', navItems.length);
  
  navItems.forEach((item, index) => {
    console.log(`Processing item ${index}:`, item.textContent.trim());
    const nestedUl = item.querySelector('ul');
    
    if (nestedUl) {
      console.log(`Item ${index} has nested ul with ${nestedUl.children.length} children`);
      console.log(`Nested ul HTML:`, nestedUl.outerHTML);
      item.classList.add('nav-drop');
      
      // Set initial aria-expanded state
      item.setAttribute('aria-expanded', 'false');
      
      // Process nested items recursively
      processNestedNav(nestedUl);
      
      // Add click handler for this level
      console.log(`Adding click handler to item ${index}:`, item.textContent.trim());
      
      // Remove any existing click handlers first
      item.removeEventListener('click', item._clickHandler);
      
      // Create the click handler function
      item._clickHandler = (e) => {
        console.log('=== CLICK EVENT FIRED ===');
        console.log('Click event fired on:', item.textContent.trim());
        console.log('isDesktop.matches:', isDesktop.matches);
        console.log('Item HTML before click:', item.outerHTML);
        
        if (isDesktop.matches) {
          e.preventDefault();
          e.stopPropagation();
          
          const expanded = item.getAttribute('aria-expanded') === 'true';
          console.log('Current expanded state:', expanded);
          
          // Close all other items at the same level
          const siblings = item.parentElement.children;
          Array.from(siblings).forEach((sibling) => {
            if (sibling !== item) {
              sibling.setAttribute('aria-expanded', 'false');
            }
          });
          
          // Toggle this item
          const newExpanded = !expanded;
          console.log('About to set aria-expanded to:', newExpanded);
          
          // Test: Set a different attribute first to see if setAttribute works
          item.setAttribute('data-test', 'working');
          console.log('Test attribute set:', item.getAttribute('data-test'));
          
          item.setAttribute('aria-expanded', newExpanded);
          console.log('Attribute set. Checking if it worked...');
          const actualValue = item.getAttribute('aria-expanded');
          console.log('Actual aria-expanded value after setting:', actualValue);
          console.log('New expanded state:', newExpanded);
          console.log('Item HTML after toggle:', item.outerHTML);
          
          // Force a reflow to ensure CSS updates
          item.offsetHeight;
          
          console.log('Clicked nav item:', item.textContent.trim(), 'Expanded:', newExpanded);
        }
      };
      
      // Add the click handler
      item.addEventListener('click', item._clickHandler);
      console.log(`Click handler added successfully to item ${index}`);
      
      console.log(`Added click handler to item ${index}`);
    } else {
      console.log(`Item ${index} has no nested ul`);
    }
  });
  console.log('=== PROCESSING NESTED NAV END ===');
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  // Only toggle top-level nav-drop elements, not nested ones
  sections.querySelectorAll('.default-content-wrapper > ul > li.nav-drop').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  console.log('Starting header decoration...');
  
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  console.log('Loading nav from path:', navPath);
  
  const fragment = await loadFragment(navPath);
  console.log('Loaded fragment:', fragment);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // Add logo and title to nav-brand
  if (navBrand) {
    // Clear existing content
    navBrand.innerHTML = '';
    
    // Create new brand link with logo and title
    const newBrandLink = document.createElement('a');
    newBrandLink.href = '/';
    newBrandLink.className = 'nav-brand-link';
    
    // Create logo image
    const logo = document.createElement('img');
    logo.src = '/icons/ghosttown.svg';
    logo.alt = 'Ghost Towns Logo';
    logo.width = 60;
    logo.height = 60;
    logo.className = 'nav-logo';
    
    // Create title text
    const title = document.createElement('span');
    title.textContent = 'Ghost Towns';
    title.className = 'nav-title';
    
    // Append logo and title to brand link
    newBrandLink.appendChild(logo);
    newBrandLink.appendChild(title);
    
    // Append brand link to nav-brand
    navBrand.appendChild(newBrandLink);
  }

  const navSections = nav.querySelector('.nav-sections');
  console.log('Found navSections:', navSections);
  
  if (navSections) {
    console.log('Nav sections HTML:', navSections.innerHTML);
    console.log('About to call processNestedNav...');
    
    // Process all nested navigation items recursively
    try {
      processNestedNav(navSections);
      console.log('processNestedNav completed successfully');
    } catch (error) {
      console.error('Error in processNestedNav:', error);
    }
    
    // Debug: Log all nav-drop elements
    const navDrops = navSections.querySelectorAll('.nav-drop');
    console.log('Found nav-drop elements:', navDrops.length);
    navDrops.forEach((drop, index) => {
      console.log(`Nav-drop ${index}:`, drop.textContent.trim());
      console.log(`Nav-drop ${index} HTML:`, drop.outerHTML);
    });
  } else {
    console.error('navSections not found!');
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  
  console.log('Header decoration complete');
}
