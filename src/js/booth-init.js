/**
 * Booth Initialization Script
 * Handles the initialization of all booth areas and their individual booths
 */

// Wait for DOM to be fully loaded
window.addEventListener("DOMContentLoaded", () => {
  // Initialize the main public booth system
  initPublic();
  
  // Initialize area manager for detailed booth controls
  if (typeof AreaManager !== 'undefined') {
    initializeAllBoothAreas();
  }
});

/**
 * Initialize all booth areas with their individual booths
 */
function initializeAllBoothAreas() {
  // Tent 1 Individual Booths (positioned from left to right, top to bottom)
  const tent1Booths = [
    // Top row (left to right)
    { id: 'tent1_booth8', name: 'Booth 8' },   // leftmost top
    { id: 'tent1_booth9', name: 'Booth 9' },   
    { id: 'tent1_booth10', name: 'Booth 10' }, 
    { id: 'tent1_booth11', name: 'Booth 11' }, 
    { id: 'tent1_booth12', name: 'Booth 12' }, 
    { id: 'tent1_booth13', name: 'Booth 13' }, // rightmost top
    // Bottom row (left to right)
    { id: 'tent1_booth7', name: 'Booth 7' },   // leftmost bottom
    { id: 'tent1_booth6', name: 'Booth 6' },   
    { id: 'tent1_booth5', name: 'Booth 5' },   
    { id: 'tent1_booth4', name: 'Booth 4' },   
    { id: 'tent1_booth3', name: 'Booth 3' },   
    { id: 'tent1_booth2', name: 'Booth 2' }    // rightmost bottom
  ];

  // Tent 2 Individual Booths (positioned from left to right, top to bottom)
  const tent2Booths = [
    // Left column (top to bottom)
    { id: 'tent2_booth19', name: 'Booth 19' }, // left top
    { id: 'tent2_booth20', name: 'Booth 20' }, 
    { id: 'tent2_booth21', name: 'Booth 21' }, 
    { id: 'tent2_booth22', name: 'Booth 22' }, 
    { id: 'tent2_booth23', name: 'Booth 23' }, 
    { id: 'tent2_booth24', name: 'Booth 24' }, // left bottom
    // Right column (top to bottom)
    { id: 'tent2_booth18', name: 'Booth 18' }, // right top
    { id: 'tent2_booth17', name: 'Booth 17' }, 
    { id: 'tent2_booth16', name: 'Booth 16' }, 
    { id: 'tent2_booth15', name: 'Booth 15' }, 
    { id: 'tent2_booth14', name: 'Booth 14' }  // right bottom
  ];

  // Tent 3 Individual Booths (positioned from left to right, top to bottom)
  const tent3Booths = [
    // Left column (top to bottom)
    { id: 'tent3_booth30', name: 'Booth 30' }, // left top
    { id: 'tent3_booth31', name: 'Booth 31' }, 
    { id: 'tent3_booth32', name: 'Booth 32' }, 
    { id: 'tent3_booth33', name: 'Booth 33' }, 
    { id: 'tent3_booth34', name: 'Booth 34' }, // left bottom
    // Right column (top to bottom)
    { id: 'tent3_booth29', name: 'Booth 29' }, // right top
    { id: 'tent3_booth28', name: 'Booth 28' }, 
    { id: 'tent3_booth27', name: 'Booth 27' }, 
    { id: 'tent3_booth26', name: 'Booth 26' }, 
    { id: 'tent3_booth25', name: 'Booth 25' }  // right bottom
  ];

  // Load booth statuses for all areas
  AreaManager.loadBoothStatuses(tent1Booths);
  AreaManager.loadBoothStatuses(tent2Booths);
  AreaManager.loadBoothStatuses(tent3Booths);

  console.log('Initialized booth areas:', {
    tent1: tent1Booths.length + ' booths',
    tent2: tent2Booths.length + ' booths',
    tent3: tent3Booths.length + ' booths'
  });
}
