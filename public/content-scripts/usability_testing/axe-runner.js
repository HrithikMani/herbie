// Enhanced Axe Accessibility Testing Content Script - Bug Fixed Version
(() => {
  'use strict';

  // State management
  const state = {
    currentlyHighlighted: null,
    highlightedElements: new Map(),
    panelElement: null,
    highlightContainer: null,
    resizeObserver: null,
    mutationObserver: null
  };

  // Constants
  const COLORS = {
    critical: '#dc3545',
    serious: '#fd7e14',
    moderate: '#ffc107',
    minor: '#17a2b8'
  };

  const Z_INDEXES = {
    highlights: 2147483646,  // Near maximum z-index
    panel: 2147483647,        // Maximum z-index
    modal: 2147483647
  };

  // Message listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handlers = {
      runAxeTest: handleRunAxeTest,
      clearAxeOverlay: handleClearOverlay
    };

    const handler = handlers[message.action];
    if (handler) {
      handler(sendResponse);
      return true; // Keep message channel open for async response
    }
  });

  // Main handlers
  async function handleRunAxeTest(sendResponse) {
    try {
      const results = await runAxeTest();
      visualizeViolations(results);
      sendResponse({ status: 'success', data: results });
    } catch (error) {
      console.error('Axe test error:', error);
      sendResponse({ status: 'error', message: error.message });
    }
  }

  function handleClearOverlay(sendResponse) {
    clearOverlay();
    sendResponse({ status: 'success' });
  }

  // Axe test execution
  async function runAxeTest() {
    if (typeof axe === 'undefined') {
      throw new Error('Axe library not loaded. Please ensure axe-core is injected.');
    }

    try {
      const results = await axe.run(document);
      console.log('Axe test results:', results);

      return {
        violations: results.violations || [],
        passes: results.passes || [],
        incomplete: results.incomplete || [],
        url: window.location.href,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error running axe test:', error);
      throw new Error(`Failed to run accessibility test: ${error.message}`);
    }
  }

  // Visualization functions
  function visualizeViolations(results) {
    clearOverlay();

    if (!results.violations || results.violations.length === 0) {
      showNoViolationsMessage();
      return;
    }

    const panel = createAnalysisPanel(results);
    state.panelElement = panel;
    document.body.appendChild(panel);
    makeDraggable(panel);
    
    // Start monitoring for DOM changes
    startDOMMonitoring();
  }

  function createAnalysisPanel(results) {
    const panel = createElement('div', {
      id: 'axe-analysis-panel',
      styles: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '85vh',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        zIndex: Z_INDEXES.panel,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        contain: 'layout style' // Performance optimization
      }
    });

    // Header
    const header = createHeader();
    panel.appendChild(header);

    // Stats
    const stats = createStats(results);
    panel.appendChild(stats);

    // Violations list
    const listContainer = createViolationsList(results);
    panel.appendChild(listContainer);

    // Setup close button after DOM insertion
    requestAnimationFrame(() => {
      const closeBtn = document.getElementById('axe-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', clearOverlay);
      }
    });

    return panel;
  }

  function createHeader() {
    const header = createElement('div', {
      className: 'axe-drag-handle',
      styles: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '18px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'move',
        userSelect: 'none'
      }
    });

    header.innerHTML = `
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Accessibility Analysis</h3>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Click violations to highlight elements</p>
      </div>
      <button id="axe-close-btn" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
         onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
    `;

    return header;
  }

  function createStats(results) {
    const violationCount = results.violations.reduce((sum, v) => sum + (v.nodes?.length || 0), 0);
    const passCount = results.passes?.length || 0;
    const incompleteCount = results.incomplete?.length || 0;

    const stats = createElement('div', {
      styles: {
        padding: '16px',
        background: '#f8f9fa',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        borderBottom: '1px solid #dee2e6'
      }
    });

    stats.innerHTML = `
      <div style="text-align: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 28px; font-weight: bold; color: #dc3545;">${violationCount}</div>
        <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">Violations</div>
      </div>
      <div style="text-align: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 28px; font-weight: bold; color: #28a745;">${passCount}</div>
        <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">Passes</div>
      </div>
      <div style="text-align: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 28px; font-weight: bold; color: #ffc107;">${incompleteCount}</div>
        <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">Incomplete</div>
      </div>
    `;

    return stats;
  }

  function createViolationsList(results) {
    const container = createElement('div', {
      styles: {
        flex: '1',
        overflowY: 'auto',
        padding: '16px',
        background: '#ffffff'
      }
    });

    if (!results.violations || results.violations.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #6c757d;">No violations found</p>';
      return container;
    }

    results.violations.forEach((violation, index) => {
      const item = createViolationItem(violation, index);
      container.appendChild(item);
    });

    return container;
  }

  function createViolationItem(violation, index) {
    const nodeCount = violation.nodes?.length || 0;
    const item = createElement('div', {
      className: 'axe-violation-item',
      dataset: { violationIndex: index },
      styles: {
        marginBottom: '12px',
        padding: '14px',
        background: 'white',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }
    });

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <span style="
          font-size: 11px;
          background: ${COLORS[violation.impact] || COLORS.minor};
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
        ">${violation.impact || 'unknown'}</span>
        <span style="
          font-size: 12px;
          color: #6c757d;
          font-weight: 500;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 6px;
        ">${nodeCount} element${nodeCount !== 1 ? 's' : ''}</span>
      </div>
      <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px; color: #212529; line-height: 1.3;">
        ${escapeHtml(violation.help || 'No description available')}
      </div>
      <div style="font-size: 11px; color: #868e96; margin-bottom: 8px; font-family: monospace;">
        ${escapeHtml(violation.id || 'unknown-rule')}
      </div>
      <div style="font-size: 13px; color: #495057; line-height: 1.5;">
        ${escapeHtml(violation.description || '')}
      </div>
    `;

    // Add hover effect
    item.addEventListener('mouseenter', () => {
      if (state.currentlyHighlighted !== index) {
        item.style.background = '#f8f9fa';
        item.style.transform = 'translateX(4px)';
      }
    });

    item.addEventListener('mouseleave', () => {
      if (state.currentlyHighlighted !== index) {
        item.style.background = 'white';
        item.style.transform = 'translateX(0)';
      }
    });

    // Click handler
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      handleViolationClick(violation, index, item);
    });

    return item;
  }

  function handleViolationClick(violation, index, item) {
    console.log('Violation clicked:', index, violation);
    
    // If clicking the same violation, show details
    if (state.currentlyHighlighted === index) {
      showViolationDetails(violation);
      return;
    }

    // Reset all items
    document.querySelectorAll('.axe-violation-item').forEach(el => {
      el.style.background = 'white';
      el.style.borderColor = '#e9ecef';
      el.style.transform = 'translateX(0)';
    });

    // Highlight selected item
    item.style.background = 'linear-gradient(to right, #f8f9fa 0%, #ffffff 100%)';
    item.style.borderColor = COLORS[violation.impact] || COLORS.minor;
    item.style.transform = 'translateX(4px)';
    item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

    // Update state and highlight elements
    state.currentlyHighlighted = index;
    highlightViolationElements(violation, index);
  }

  function highlightViolationElements(violation, violationIndex) {
    console.log('Starting highlight for violation:', violationIndex, violation);
    clearHighlights();

    if (!violation.nodes || violation.nodes.length === 0) {
      console.warn('No nodes to highlight for violation:', violation);
      return;
    }

    // Create highlight container with absolute positioning
    const container = createElement('div', {
      id: 'axe-highlight-container',
      styles: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '0',
        height: '0',
        pointerEvents: 'none',
        zIndex: Z_INDEXES.highlights.toString()
      }
    });

    state.highlightContainer = container;
    document.body.appendChild(container);

    let firstElement = null;
    const highlightResults = [];

    violation.nodes.forEach((node, nodeIndex) => {
      const result = highlightNode(node, violation, violationIndex, nodeIndex);
      highlightResults.push(result);
      
      if (result.element && !firstElement) {
        firstElement = result.element;
      }
    });

    // Log results
    const successCount = highlightResults.filter(r => r.success).length;
    console.log(`Highlighting results: ${successCount}/${violation.nodes.length} successful`);
    
    // Log any failures for debugging
    highlightResults.forEach((result, idx) => {
      if (!result.success) {
        console.warn(`Failed to highlight node ${idx}:`, result.error, violation.nodes[idx]);
      }
    });

    // Scroll to first element if found
    if (firstElement) {
      try {
        firstElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      } catch (e) {
        console.warn('Could not scroll to element:', e);
      }
    }

    // Start monitoring these specific elements for changes
    startElementMonitoring();
  }

  function highlightNode(node, violation, violationIndex, nodeIndex) {
    const result = { success: false, element: null, error: null };
    
    try {
      console.log(`Attempting to highlight node ${nodeIndex}:`, node);
      
      // Find the element using multiple strategies
      const element = findElement(node);
      
      if (!element) {
        result.error = 'Element not found with any strategy';
        console.warn(`Could not find element for node ${nodeIndex}:`, node);
        return result;
      }

      result.element = element;
      console.log(`Found element for node ${nodeIndex}:`, element);

      // Get the element's position
      const rect = element.getBoundingClientRect();
      
      // Check if element is visible
      if (rect.width === 0 && rect.height === 0) {
        console.log(`Element has no dimensions, trying to find visible parent for node ${nodeIndex}`);
        // Try to make it visible or get parent
        const visibleParent = findVisibleParent(element);
        if (visibleParent) {
          result.element = visibleParent;
          const parentRect = visibleParent.getBoundingClientRect();
          if (parentRect.width > 0 || parentRect.height > 0) {
            console.log(`Using visible parent for node ${nodeIndex}:`, visibleParent);
            createHighlightBox(visibleParent, parentRect, violation, violationIndex, nodeIndex);
            result.success = true;
            return result;
          }
        }
        result.error = 'Element not visible and no visible parent found';
        console.warn(`Element not visible for node ${nodeIndex}`);
        return result;
      }

      // Create highlight for the element
      console.log(`Creating highlight box for node ${nodeIndex} at:`, rect);
      createHighlightBox(element, rect, violation, violationIndex, nodeIndex);
      result.success = true;
      
    } catch (error) {
      result.error = error.message;
      console.error(`Error highlighting node ${nodeIndex}:`, error, node);
    }
    
    return result;
  }

  // Helper function to clean selectors - defined before use
  function cleanSelector(selector) {
    if (!selector) return selector;
    
    // Remove any escaped characters that might cause issues
    let clean = selector.trim();
    
    // Handle escaped colons (common in pseudo-selectors)
    clean = clean.replace(/\\:/g, ':');
    
    // Handle escaped dots
    clean = clean.replace(/\\\./g, '.');
    
    // Handle escaped brackets
    clean = clean.replace(/\\\[/g, '[').replace(/\\\]/g, ']');
    
    // Handle escaped quotes
    clean = clean.replace(/\\"/g, '"').replace(/\\'/g, "'");
    
    // If selector starts with a problematic character, try to fix it
    if (clean.startsWith(':')) {
      clean = '*' + clean;
    }
    
    return clean;
  }

  function findElement(node) {
    if (!node) return null;
    
    let element = null;
    
    // Strategy 1: Try each selector in the target array
    if (node.target && Array.isArray(node.target)) {
      for (const selector of node.target) {
        if (typeof selector === 'string') {
          // Clean up the selector
          const cleanedSelector = cleanSelector(selector);
          
          try {
            element = document.querySelector(cleanedSelector);
            if (element) {
              console.log('Found element with selector:', cleanedSelector);
              return element;
            }
          } catch (e) {
            console.warn('Invalid selector:', cleanedSelector, e);
            // Try without cleaning as fallback
            try {
              element = document.querySelector(selector);
              if (element) {
                console.log('Found element with original selector:', selector);
                return element;
              }
            } catch (e2) {
              console.warn('Original selector also failed:', selector);
            }
          }
        }
      }
    }
    
    // Strategy 2: If node has xpath, try that
    if (node.xpath && Array.isArray(node.xpath) && node.xpath.length > 0) {
      for (const xpath of node.xpath) {
        element = getElementByXPath(xpath);
        if (element) {
          console.log('Found element with XPath:', xpath);
          return element;
        }
      }
    }
    
    // Strategy 3: Try to find by HTML content if available
    if (node.html) {
      element = findElementByHTML(node.html);
      if (element) {
        console.log('Found element by HTML content');
        return element;
      }
    }
    
    // Strategy 4: If we have any other identifying information
    if (node.any && Array.isArray(node.any) && node.any.length > 0) {
      // Try to find using the "any" checks information
      element = findElementByAnyChecks(node.any);
      if (element) {
        console.log('Found element using any checks');
        return element;
      }
    }
    
    // Strategy 5: Try to parse HTML and extract attributes for search
    if (node.html) {
      element = findElementByParsedHTML(node.html);
      if (element) {
        console.log('Found element by parsed HTML attributes');
        return element;
      }
    }
    
    return null;
  }

  function getElementByXPath(xpath) {
    try {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    } catch (e) {
      console.warn('Invalid XPath:', xpath, e);
      return null;
    }
  }

  function findElementByHTML(html) {
    if (!html) return null;
    
    try {
      // First try to extract unique attributes from the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const tempElement = tempDiv.firstElementChild;
      
      if (tempElement) {
        // Try to find by unique attributes
        const tagName = tempElement.tagName.toLowerCase();
        let selector = tagName;
        
        // Try by ID
        if (tempElement.id) {
          const found = document.getElementById(tempElement.id);
          if (found) return found;
        }
        
        // Try by exact class combination
        if (tempElement.className) {
          selector += '.' + tempElement.className.split(' ').filter(c => c).join('.');
          try {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
              if (el.outerHTML === html) return el;
            }
          } catch (e) {
            console.warn('Class selector failed:', selector);
          }
        }
        
        // Try by aria-hidden attribute (common in the error)
        if (tempElement.hasAttribute('aria-hidden')) {
          const value = tempElement.getAttribute('aria-hidden');
          const elements = document.querySelectorAll(`${tagName}[aria-hidden="${value}"]`);
          for (const el of elements) {
            // Check if HTML structures match closely
            if (el.className === tempElement.className) {
              return el;
            }
          }
        }
        
        // Try by style attribute (for positioned elements)
        if (tempElement.hasAttribute('style')) {
          const elements = document.querySelectorAll(tagName);
          for (const el of elements) {
            if (el.getAttribute('style') && 
                el.className === tempElement.className &&
                el.getAttribute('aria-hidden') === tempElement.getAttribute('aria-hidden')) {
              return el;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error parsing HTML for element search:', e);
    }
    
    // Fallback: Try exact HTML match
    const allElements = document.getElementsByTagName('*');
    for (const el of allElements) {
      if (el.outerHTML === html) {
        return el;
      }
    }
    
    return null;
  }

  function findElementByParsedHTML(html) {
    if (!html) return null;
    
    try {
      // Parse the HTML to extract attributes
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const parsedElement = doc.body.firstElementChild;
      
      if (!parsedElement) return null;
      
      // Build a selector based on the parsed attributes
      const tagName = parsedElement.tagName.toLowerCase();
      const attributes = [];
      
      // Check for specific attributes that might help identify the element
      const checkAttributes = ['aria-hidden', 'role', 'data-testid', 'data-id', 'tabindex'];
      
      for (const attr of checkAttributes) {
        if (parsedElement.hasAttribute(attr)) {
          const value = parsedElement.getAttribute(attr);
          attributes.push(`[${attr}="${value}"]`);
        }
      }
      
      if (attributes.length > 0) {
        const selector = tagName + attributes.join('');
        try {
          const elements = document.querySelectorAll(selector);
          
          // If we have classes, use them to narrow down
          if (parsedElement.className) {
            const classes = parsedElement.className.split(' ').filter(c => c);
            for (const el of elements) {
              const elClasses = el.className.split(' ').filter(c => c);
              if (classes.every(c => elClasses.includes(c))) {
                return el;
              }
            }
          }
          
          // Return first match if no class filtering needed
          if (elements.length > 0) {
            return elements[0];
          }
        } catch (e) {
          console.warn('Parsed selector failed:', selector);
        }
      }
    } catch (e) {
      console.warn('Error in findElementByParsedHTML:', e);
    }
    
    return null;
  }

  function findElementByAnyChecks(anyChecks) {
    // This is a fallback strategy using the "any" check data
    for (const check of anyChecks) {
      if (check.relatedNodes && check.relatedNodes.length > 0) {
        for (const relatedNode of check.relatedNodes) {
          const element = findElement(relatedNode);
          if (element) return element;
        }
      }
    }
    return null;
  }

  function findVisibleParent(element) {
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  function createHighlightBox(element, rect, violation, violationIndex, nodeIndex) {
    const color = COLORS[violation.impact] || COLORS.minor;
    
    // Account for scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Create highlight box with absolute positioning
    const box = createElement('div', {
      className: 'axe-highlight-box',
      styles: {
        position: 'absolute',
        top: `${rect.top + scrollTop}px`,
        left: `${rect.left + scrollLeft}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        border: `3px solid ${color}`,
        backgroundColor: `${color}20`,
        pointerEvents: 'none',
        boxSizing: 'border-box',
        borderRadius: '4px',
        zIndex: Z_INDEXES.highlights.toString()
      }
    });

    // Add badge
    const badge = createElement('div', {
      styles: {
        position: 'absolute',
        top: '-12px',
        left: '-12px',
        background: color,
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        zIndex: (Z_INDEXES.highlights + 1).toString()
      }
    });
    badge.textContent = `${violationIndex + 1}.${nodeIndex + 1}`;
    box.appendChild(badge);

    // Add to container
    if (state.highlightContainer) {
      state.highlightContainer.appendChild(box);
    }
    
    // Store reference for updates
    state.highlightedElements.set(`${violationIndex}-${nodeIndex}`, {
      element,
      box,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    });

    // Add animation
    requestAnimationFrame(() => {
      box.style.animation = 'axePulse 2s ease-in-out infinite';
    });
  }

  function updateHighlightPositions() {
    // Update positions of all highlighted elements
    state.highlightedElements.forEach((data, key) => {
      if (data.element && data.box) {
        const rect = data.element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        data.box.style.top = `${rect.top + scrollTop}px`;
        data.box.style.left = `${rect.left + scrollLeft}px`;
        data.box.style.width = `${rect.width}px`;
        data.box.style.height = `${rect.height}px`;
      }
    });
  }

  function startDOMMonitoring() {
    // Monitor window resize
    window.addEventListener('resize', updateHighlightPositions);
    window.addEventListener('scroll', updateHighlightPositions);
    
    // Monitor DOM changes
    if (!state.mutationObserver) {
      state.mutationObserver = new MutationObserver(() => {
        requestAnimationFrame(updateHighlightPositions);
      });
      
      state.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
  }

  function startElementMonitoring() {
    // Use ResizeObserver for more accurate size change detection
    if (!state.resizeObserver) {
      state.resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateHighlightPositions);
      });
    }
    
    // Observe each highlighted element
    state.highlightedElements.forEach((data) => {
      if (data.element) {
        state.resizeObserver.observe(data.element);
      }
    });
  }

  function stopDOMMonitoring() {
    window.removeEventListener('resize', updateHighlightPositions);
    window.removeEventListener('scroll', updateHighlightPositions);
    
    if (state.mutationObserver) {
      state.mutationObserver.disconnect();
      state.mutationObserver = null;
    }
    
    if (state.resizeObserver) {
      state.resizeObserver.disconnect();
      state.resizeObserver = null;
    }
  }

  function clearHighlights() {
    if (state.highlightContainer) {
      state.highlightContainer.remove();
      state.highlightContainer = null;
    }
    state.highlightedElements.clear();
    
    // Clean up observers for these elements
    if (state.resizeObserver) {
      state.resizeObserver.disconnect();
    }
  }

  function showViolationDetails(violation) {
    // Remove existing detail popup if any
    const existing = document.getElementById('axe-detail-backdrop');
    if (existing) existing.remove();

    const backdrop = createElement('div', {
      id: 'axe-detail-backdrop',
      styles: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        zIndex: Z_INDEXES.modal.toString(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease'
      }
    });

    const popup = createElement('div', {
      id: 'axe-detail-popup',
      styles: {
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '28px',
        overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        animation: 'slideUp 0.3s ease'
      }
    });

    const nodeCount = violation.nodes?.length || 0;

    popup.innerHTML = `
      <button id="close-detail-btn" style="
        position: absolute;
        top: 16px;
        right: 16px;
        background: #f1f3f5;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      " onmouseover="this.style.background='#e9ecef'" 
         onmouseout="this.style.background='#f1f3f5'">×</button>
      
      <div style="margin-bottom: 20px;">
        <span style="
          background: ${COLORS[violation.impact] || COLORS.minor};
          color: white;
          padding: 6px 12px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        ">${violation.impact || 'unknown'}</span>
      </div>
      
      <h3 style="margin: 0 40px 16px 0; font-size: 22px; color: #212529; line-height: 1.3;">
        ${escapeHtml(violation.help || 'No description available')}
      </h3>
      
      <p style="margin: 0 0 24px 0; color: #495057; font-size: 15px; line-height: 1.6;">
        ${escapeHtml(violation.description || '')}
      </p>
      
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #495057;">Rule ID</div>
        <code style="
          font-size: 14px;
          background: white;
          padding: 8px 12px;
          border-radius: 6px;
          display: inline-block;
          color: #e83e8c;
          border: 1px solid #dee2e6;
        ">${escapeHtml(violation.id || 'unknown-rule')}</code>
      </div>
      
      <div style="
        background: #d1ecf1;
        border-left: 4px solid #17a2b8;
        padding: 16px;
        border-radius: 4px;
        margin-bottom: 24px;
      ">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #0c5460;">
          Affected Elements: ${nodeCount}
        </div>
        <div style="font-size: 13px; color: #0c5460; line-height: 1.5;">
          Elements remain highlighted on the page. Close this dialog to inspect them.
        </div>
      </div>
      
      ${violation.helpUrl ? `
        <a href="${escapeHtml(violation.helpUrl)}" target="_blank" rel="noopener noreferrer" style="
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102,126,234,0.4)'" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          Learn More →
        </a>
      ` : ''}
    `;

    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);

    // Event listeners
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.remove();
      }
    });

    const closeBtn = popup.querySelector('#close-detail-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => backdrop.remove());
    }

    // Add CSS animations if not already present
    addAnimationStyles();
  }

  function showNoViolationsMessage() {
    const msg = createElement('div', {
      id: 'axe-analysis-panel',
      styles: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        zIndex: Z_INDEXES.panel.toString(),
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        animation: 'slideUp 0.3s ease'
      }
    });

    msg.innerHTML = `
      <div style="
        font-size: 64px;
        margin-bottom: 20px;
        color: #28a745;
        animation: 'checkmark 0.5s ease';
      ">✓</div>
      <h3 style="
        margin: 0 0 12px 0;
        color: #28a745;
        font-size: 24px;
        font-weight: 600;
      ">Excellent! No Violations Found</h3>
      <p style="
        margin: 0 0 28px 0;
        color: #6c757d;
        font-size: 15px;
      ">This page passed all accessibility tests.</p>
      <button onclick="this.parentElement.remove()" style="
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 500;
        transition: transform 0.2s, box-shadow 0.2s;
      " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(40,167,69,0.4)'" 
         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        Close
      </button>
    `;

    document.body.appendChild(msg);
    addAnimationStyles();
  }

  function clearOverlay() {
    // Stop monitoring first
    stopDOMMonitoring();
    
    // Clear all UI elements
    if (state.panelElement) {
      state.panelElement.remove();
      state.panelElement = null;
    }

    clearHighlights();

    // Clear any modals
    const backdrop = document.getElementById('axe-detail-backdrop');
    if (backdrop) backdrop.remove();

    // Reset state
    state.currentlyHighlighted = null;
  }

  // Utility functions
  function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.id) element.id = options.id;
    if (options.className) element.className = options.className;
    if (options.dataset) {
      Object.entries(options.dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
      });
    }
    if (options.styles) {
      Object.entries(options.styles).forEach(([key, value]) => {
        element.style[key] = value;
      });
    }
    
    return element;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function makeDraggable(element) {
    const handle = element.querySelector('.axe-drag-handle');
    if (!handle) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    handle.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      isDragging = true;
      
      document.addEventListener('mousemove', elementDrag);
      document.addEventListener('mouseup', closeDragElement);
      
      // Add dragging styles
      element.style.transition = 'none';
      element.style.cursor = 'move';
    }

    function elementDrag(e) {
      if (!isDragging) return;
      
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      const newTop = element.offsetTop - pos2;
      const newLeft = element.offsetLeft - pos1;
      
      // Keep panel within viewport
      const maxTop = window.innerHeight - element.offsetHeight;
      const maxLeft = window.innerWidth - element.offsetWidth;
      
      element.style.top = Math.min(Math.max(0, newTop), maxTop) + 'px';
      element.style.left = Math.min(Math.max(0, newLeft), maxLeft) + 'px';
      element.style.right = 'auto';
    }

    function closeDragElement() {
      isDragging = false;
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('mouseup', closeDragElement);
      
      // Restore styles
      element.style.transition = '';
      element.style.cursor = '';
    }
  }

  function addAnimationStyles() {
    if (document.getElementById('axe-animation-styles')) return;

    const style = document.createElement('style');
    style.id = 'axe-animation-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes axePulse {
        0%, 100% { 
          opacity: 1;
          transform: scale(1);
        }
        50% { 
          opacity: 0.7;
          transform: scale(1.02);
        }
      }
      
      @keyframes checkmark {
        0% {
          transform: scale(0) rotate(45deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.2) rotate(45deg);
        }
        100% {
          transform: scale(1) rotate(0);
          opacity: 1;
        }
      }
      
      /* Ensure our elements stay on top */
      #axe-highlight-container * {
        z-index: 2147483646 !important;
      }
      
      #axe-analysis-panel {
        z-index: 2147483647 !important;
      }
      
      #axe-detail-backdrop {
        z-index: 2147483647 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize animations on load
  addAnimationStyles();

  console.log('Enhanced Axe accessibility testing content script loaded (Bug Fixed Version)');
})();