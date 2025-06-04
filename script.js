function toggleMenu() {
    var menu = document.getElementById('sidebar');
    if (menu.style.width === '250px') {
        menu.style.width = '0'; // Hide sidebar
    } else {
        menu.style.width = '250px'; // Show sidebar
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show"); // Toggle the 'show' class
}


// (1) Load manuscripts from JSON file
async function loadManuscripts() {
    try {
        const response = await fetch('manuscripts.json'); // Path to JSON file
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const manuscripts = await response.json();

        const manuscriptsList = document.getElementById('manuscripts-list');
        manuscriptsList.innerHTML = ''; // Clear existing content

        manuscripts.forEach((manuscript, index) => {
            // Determines colour of manuscript title based on the group
            let titleColor;
            switch (manuscript.group) {
                case 'Ξ':
                    titleColor = 'red'; // Colour for group Ξ
                    break;
                case 'Λ':
                    titleColor = 'blue'; // Colour for group Λ
                    break;
                default:
                    titleColor = 'black'; // Default colour for ungrouped manuscripts
            }

            //add manuscript data to HTML

            manuscriptsList.innerHTML += `
                <div class="manuscript" 
                    data-id="${index}" 
                    data-place="${manuscript.location}" 
                    data-date="${manuscript.date}" 
                    data-digitised="${manuscript.digitised}"
                    data-complete="${manuscript.complete}"
                    data-group="${manuscript.group}"
                    data-illuminated="${manuscript.illuminated}"
                    data-provenance="${manuscript.provenance}"
                    data-origin="${manuscript.origin}" 
                    data-composite="${manuscript.composite === 'yes' ? 'interpolated' : ''}">
                   



                    <h3><a href="manuscript.html?id=${index}" style="color: ${titleColor}; text-decoration: none;">${manuscript.shelfmark}</a></h3>
                    <p>${manuscript.library}</p>
                </div>
            `;
        });

        // Total manuscript count after filtering 
        updateManuscriptCount();

    } catch (error) {
        console.error('Error loading manuscripts:', error);
        const manuscriptsList = document.getElementById('manuscripts-list');
        manuscriptsList.innerHTML = '<p>Error loading manuscripts. Please check the console for details.</p>';
    }
}

// Toggle more details visibility
function toggleMoreDetails(button) {
    const moreDetailsSection = button.nextElementSibling; // Get the next sibling element
    const moreDetailsButtonSpan = button.querySelector('span'); // Get the span for the arrow

    if (moreDetailsSection) {
        moreDetailsSection.classList.toggle("hidden");
        // Toggle arrow direction
        moreDetailsButtonSpan.innerHTML = moreDetailsSection.classList.contains("hidden") ? "&#9660;" : "&#9650;";
    }
}


// (2) Load manuscript details when visiting manuscript.html
function loadManuscriptDetails() {
    const params = new URLSearchParams(window.location.search);
    const manuscriptId = params.get('id');

    fetch('manuscripts.json') // Path to your JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(manuscripts => {
            if (manuscriptId && manuscripts[manuscriptId]) {
                const manuscript = manuscripts[manuscriptId];
                const detailsSection = document.getElementById('manuscript-details');
                
                // HTML content- order determines order on ms page (can change order here)
                let content = `
    <div class="breadcrumbs">
        <a href="index.html">Home</a> &gt; 
        <a href="manuscripts.html">Manuscripts</a> &gt; 
        <span>${manuscript.shelfmark}</span>
    </div>
    <h2>${manuscript.shelfmark}</h2>

     

                    <p><strong>Date:</strong> ${manuscript.date}</p>
                    <p><strong>Country:</strong> ${manuscript.location}</p> 
                    <p><strong>Library:</strong> ${manuscript.library}</p>


                    `;

              
                    content += `
                    <button class="more-details-btn" onclick="toggleMoreDetails(this)">More Details <span>&#9660;</span></button>
                    <div class="more-details hidden">
                        <p><strong>Origin:</strong> ${manuscript.origin}</p>
                        <p><strong>Provenance:</strong> ${manuscript.provenance}</p>
                        <p><strong>Complete:</strong> ${manuscript.complete === "yes" ? "Yes" : "No"}</p>
                        ${manuscript.complete === "no" ? `
                                <ul>
                                    ${manuscript.incompleteHow && manuscript.incompleteHow.length > 0 ? 
                                        manuscript.incompleteHow.map(how => `<li>${how}</li>`).join('') : 
                                        `<li>No specific reasons available</li>`}
                                </ul>
                            ` : ''}
                        <p><strong>Illuminated:</strong> ${manuscript.illuminated === "yes" ? "Yes" : "No"}</p>
                        <p><strong>Interpolated:</strong> ${manuscript.composite === "yes" ? "Yes" : "No"}</p>
                         ${manuscript.composite === "yes" && manuscript.texts && manuscript.texts.length > 0 ? `
        
            <button  class="more-details-btn" onclick="this.nextElementSibling.classList.toggle('hidden')">Also Contains <span>&#9660;</span></button>
        <div class="composite-details hidden">
            <ul>
                ${manuscript.texts.map(text => `<li>${text}</li>`).join('')}
            </ul>
        </div>
    ` : ''}
                       
                              
                        <p><strong>Digitised:</strong> ${manuscript.digitised === "yes" ? "Yes" : "No"}</p>
                        <p><strong>Group:</strong> ${manuscript.group}</p>
                <p><strong>Further Information:</strong></p>
<ul>
    ${(Array.isArray(manuscript.description) ? manuscript.description : [manuscript.description])
        .map(item => `<li>${item}</li>`).join('')}
</ul>

    </div>
                `;

               // … after the mirador‐embed or fallback image block …
content += `
<div class="button-group" style="margin-top:20px; margin-bottom:20px;">
  <a 
    href="${manuscript.onlineRecord}" 
    target="_blank" 
    class="button"
  >
    View Online Catalogue Entry
  </a>
</div>
`;

                
                




                
                
            // add mirador and IIIF button if manifest is present in json file
            if (manuscript.compatibleWithMirador) {
                content += `
                    <p>
                        <a href="${manuscript.manifestId}" target="_blank" class="buttoniiif" style="text-decoration: none;">
                            <img src="images/iiif_notext.png" alt="IIIF Logo" style="width: 40px; height: auto; vertical-align: middle;"/> 
                        </a>
                    </p>`;
}


              // sets HTML content for chosen ms


                if (manuscript.compatibleWithMirador && manuscript.manifestId) {
                    // Embed Mirador inline instead of an image
                    content += `
                        <div class="mirador-embed-wrapper">
                            <iframe 
                                src="https://projectmirador.org/embed/?iiif-content=${encodeURIComponent(manuscript.manifestId)}" 
                                width="100%" 
                                height="600" 
                                allowfullscreen 
                                style="border: none; margin-top: 20px;">
                            </iframe>
                        </div>
                    `;
                } else {
                    // Fallback to static image + credit info
                    const imageUrl = manuscript.imageUrl || 'default_image.jpg';
                    content += `
                        <div class="manuscript-media">
                            <img class="manuscript-image" src="${imageUrl}" alt="Image of ${manuscript.shelfmark}" />
                            <p><strong>Image Credit:</strong> ${manuscript.imageCredit || 'Not specified'}</p>
                            <p><strong>License:</strong> ${manuscript.license || 'N/A'}</p>
                            <p><strong>URN:</strong> ${manuscript.URN || 'N/A'}</p>
                        </div>
                    `;
                }
                



                detailsSection.innerHTML = content;
            } else {
                document.getElementById('manuscript-details').innerHTML = '<p>Manuscript not found.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading manuscript details:', error);
            document.getElementById('manuscript-details').innerHTML = '<p>Error loading manuscript details. Please check the console for details.</p>';
        });
}



// (3) Counts visible manuscripts 
function updateManuscriptCount() {
    const manuscriptElements = document.querySelectorAll('.manuscript');
    const visibleCount = Array.from(manuscriptElements).filter(manuscript => manuscript.style.display !== 'none').length;

    document.getElementById('manuscript-count').innerText = `Showing ${visibleCount} manuscript(s)`;
}

// (4) Filter manuscripts 

//retrieves filter options selected by user
function filterManuscripts() {
    const shelfmarkFilter = document.getElementById('filter-shelfmark').value.toLowerCase(); //makes filter case insensitive
    const placeFilter = document.getElementById('filter-place').value;
    const dateFilter = document.getElementById('filter-date').value;
    const languageFilter = document.getElementById('filter-language').value;
    const digitisedFilter = document.getElementById('filter-digitised').value.toLowerCase();
    const completeFilter = document.getElementById('filter-complete').value.toLowerCase();
    const groupFilter = document.getElementById('filter-group').value; 
    const compositeFilter = document.getElementById('filter-composite').value.toLowerCase(); 


    const manuscriptElements = document.querySelectorAll('.manuscript');


    manuscriptElements.forEach(manuscript => { //selects all manuscripts
        //retrieves attributes from manuscripts
        const shelfmark = manuscript.querySelector('h3 a').textContent.toLowerCase(); 
        const place = manuscript.getAttribute('data-place');
        const date = manuscript.getAttribute('data-date');
        const digitised = manuscript.getAttribute('data-digitised');
        const complete = manuscript.getAttribute('data-complete');
        const group = manuscript.getAttribute('data-group'); 
        const language = manuscript.getAttribute('data-language'); 
        const composite = manuscript.getAttribute('data-composite'); 



        //checks if ms matches chosen attributes 

        const matchesshelfmark = shelfmark.includes(shelfmarkFilter);
        const matchesPlace = placeFilter === '' || place === placeFilter;
        const matchesDate = dateFilter === '' || date === dateFilter;
        const matchesDigitised = digitisedFilter === '' ||  (digitised && digitised.toLowerCase() === digitisedFilter);
        const matchesComplete = completeFilter === '' ||  (complete && complete.toLowerCase() === completeFilter);
        const matchesGroup = groupFilter === '' || group === groupFilter; // Add group filter logic
        const matchesLanguage = languageFilter === '' || language === languageFilter; // Language filter logic
        const matchesComposite = compositeFilter === '' || (composite && composite.toLowerCase() === compositeFilter.toLowerCase());


        if (matchesshelfmark && matchesPlace && matchesDate && matchesDigitised && matchesComplete && matchesGroup && matchesLanguage && matchesComposite) {
            manuscript.style.display = ''; // Show manuscript (if matches)
        } else {
            manuscript.style.display = 'none'; // Hide manuscript (if doesn't match)
        }
    });

    updateManuscriptCount();
}

// (5) Event listeners for the filter inputsn (monitor changes to filter options )
document.getElementById('filter-shelfmark')?.addEventListener('input', filterManuscripts);
document.getElementById('filter-place')?.addEventListener('change', filterManuscripts);
document.getElementById('filter-date')?.addEventListener('change', filterManuscripts);
document.getElementById('filter-digitised')?.addEventListener('change', filterManuscripts);
document.getElementById('filter-complete')?.addEventListener('change', filterManuscripts);
document.getElementById('filter-group')?.addEventListener('change', filterManuscripts);
document.getElementById('filter-language')?.addEventListener('change', filterManuscripts);
document.getElementById('filter-composite')?.addEventListener('change', filterManuscripts);



// (6) Call appropriate load functions on page load (manuscript or manuscripts)
window.onload = function() {
    if (document.getElementById('manuscripts-list')) { //load manuscript details onto manuscripts.html
        loadManuscripts();
    } else {
        loadManuscriptDetails(); //load individual manuscript details 
    }
    updateManuscriptCount();
}

// (7) Clear filter button
document.getElementById("clear-filters")?.addEventListener("click", function() {
    // Clear the search bar
    document.getElementById("filter-shelfmark").value = "";
    
    // Reset the select elements to the default option
    document.getElementById("filter-place").selectedIndex = 0; // Reset place filter
    document.getElementById("filter-date").selectedIndex = 0; // Reset date filter
    document.getElementById("filter-digitised").selectedIndex = 0; // Reset digitised filter
    document.getElementById("filter-complete").selectedIndex = 0; // Reset complete filter
    document.getElementById("filter-group").selectedIndex = 0; // Reset group filter
    document.getElementById("filter-language").selectedIndex = 0; // Reset language filter
    document.getElementById("filter-composite").selectedIndex = 0; // Reset language filter


    // Call this function to apply empty filters
    filterManuscripts(); // Call this instead of loadManuscripts
});

    // Fetch the JSON data and render the gallery
    fetch('manuscripts.json') // Update with the correct path to your JSON file
    .then(response => response.json())
    .then(data => {
        const galleryContainer = document.getElementById('gallery-container');
        data.forEach(manuscript => {
            if (manuscript.imageUrl) { // Ensure the imageUrl exists
                const galleryItem = document.createElement('div');
                galleryItem.classList.add('gallery');
                galleryItem.setAttribute('data-place', manuscript.location);
                galleryItem.setAttribute('data-date', manuscript.date);
                galleryItem.setAttribute('data-digitised', manuscript.digitised);
                galleryItem.setAttribute('data-complete', manuscript.complete);
                galleryItem.setAttribute('data-group', manuscript.group);
                galleryItem.setAttribute('data-composite', manuscript.composite === 'yes' ? 'interpolated' : '');



                const link = document.createElement('a');
                link.target = '_blank';
                link.href = `manuscript.html?id=${manuscript.id}`;

                const img = document.createElement('img');
                img.src = manuscript.imageUrl;
                img.alt = manuscript.shelfmark;

                const desc = document.createElement('div');
                desc.classList.add('desc');
                desc.innerHTML = `
                <span class="shelfmark">${manuscript.shelfmark}</span><br>
                <span id="credits">${manuscript.license}</span><br>
                <span id="credits"> ${manuscript.URN}</span>
                `;

                

                link.appendChild(img);
                galleryItem.appendChild(link);
                galleryItem.appendChild(desc);
                galleryContainer.appendChild(galleryItem);
            }


        // Define the filterGallery function
        function filterGallery() {
            const shelfmarkFilter = document.getElementById('filter-shelfmark').value.toLowerCase();
            const placeFilter = document.getElementById('filter-place').value;
            const dateFilter = document.getElementById('filter-date').value;
            const digitisedFilter = document.getElementById('filter-digitised').value;
            const completeFilter = document.getElementById('filter-complete').value.toLowerCase();
            const groupFilter = document.getElementById('filter-group').value;
            const compositeFilter = document.getElementById('filter-composite').value;
        
            const galleryItems = document.querySelectorAll('.gallery');
        
            galleryItems.forEach(galleryItem => {
                const shelfmark = galleryItem.querySelector('.desc .shelfmark')?.textContent.toLowerCase() || '';
                const place = galleryItem.getAttribute('data-place');
                const date = galleryItem.getAttribute('data-date');
                const digitised = galleryItem.getAttribute('data-digitised');
                const complete = galleryItem.getAttribute('data-complete');
                const group = galleryItem.getAttribute('data-group');
                const composite = galleryItem.getAttribute('data-composite');
        
                const matchesshelfmark = shelfmark.includes(shelfmarkFilter);
                const matchesPlace = placeFilter === '' || place === placeFilter;
                const matchesDate = dateFilter === '' || date === dateFilter;
                const matchesDigitised = digitisedFilter === '' || digitised === digitisedFilter;
                const matchesComplete = completeFilter === '' ||  (complete && complete.toLowerCase() === completeFilter);
                const matchesGroup = groupFilter === '' || group === groupFilter;
                const matchesComposite = compositeFilter === '' || composite === 'interpolated';
        
                if (matchesshelfmark && matchesPlace && matchesDate && matchesDigitised && matchesComplete && matchesGroup && matchesLanguage && matchesComposite) {
                    galleryItem.style.display = '';
                } else {
                    galleryItem.style.display = 'none';
                }
            });
        }
        
// Event listeners for gallery filter inputs
document.getElementById('filter-shelfmark')?.addEventListener('input', filterGallery);
document.getElementById('filter-place')?.addEventListener('change', filterGallery);
document.getElementById('filter-date')?.addEventListener('change', filterGallery);
document.getElementById('filter-digitised')?.addEventListener('change', filterGallery);
document.getElementById('filter-complete')?.addEventListener('change', filterGallery);
document.getElementById('filter-group')?.addEventListener('change', filterGallery);
document.getElementById('filter-composite')?.addEventListener('change', filterGallery);


// Clear filters button logic
document.getElementById("clear-filters")?.addEventListener("click", function() {
    document.getElementById("filter-place").selectedIndex = 0;
    document.getElementById("filter-date").selectedIndex = 0;
    document.getElementById("filter-digitised").selectedIndex = 0;
    document.getElementById("filter-complete").selectedIndex = 0;
    document.getElementById("filter-group").selectedIndex = 0;
    document.getElementById("filter-composite").selectedIndex = 0;


    filterGallery();
});

        });

    })
    .catch(error => console.error('Error fetching the JSON data:', error));


// Toggle Advanced Filters in Filter Sidebar
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.querySelector(".toggle-advanced-filters");
    const advancedFilters = document.querySelector(".advanced-filters");

    if (toggleButton && advancedFilters) {
        toggleButton.addEventListener("click", function () {
            advancedFilters.classList.toggle("hidden");
            toggleButton.textContent = advancedFilters.classList.contains("hidden")
                ? "Advanced Filters ▼"
                : "Advanced Filters ▲";
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const textID = window.location.pathname.replace(".html", "");
    fetch("texts.json")
        .then(response => response.json())
        .then(manuscripts => {
            const manuscriptsWithText = manuscripts.filter(manuscript =>
                manuscript.texts.some(text => text.textID === textID)
            );

            const manuscriptList = document.getElementById("manuscript-list");
            if (manuscriptsWithText.length > 0) {
                let content = "<ul>";
                manuscriptsWithText.forEach(manuscript => {
                    content += `<li>${manuscript.shelfmark}</li>`;
                });
                content += "</ul>";
                manuscriptList.innerHTML = content;
            } else {
                manuscriptList.innerHTML = "<p>No manuscripts found for this text.</p>";
            }
        })
        .catch(error => {
            console.error("Error loading manuscripts:", error);
            document.getElementById("manuscript-list").innerHTML = "<p>Error loading data.</p>";
        });
});



function openTab(event, tabName) {
    const tabcontents = document.querySelectorAll('.tabcontent');
    tabcontents.forEach(tab => tab.style.display = 'none');

    const tablinks = document.querySelectorAll('.tablinks');
    tablinks.forEach(link => link.className = link.className.replace(' active', ''));

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.className += ' active';
}
// -----------------------------
// script.js (updated for flat “title + content” model)
// -----------------------------

/**
 * 1) Fetch all texts from texts.json.
 *    Each entry must be: { id: string, title: string, content: string (HTML) }.
 */
async function fetchAllTexts() {
    const resp = await fetch('texts.json');
    if (!resp.ok) {
      throw new Error(`Failed to load texts.json (status ${resp.status})`);
    }
    return await resp.json(); // expects an array of { id, title, content }
  }
  
  /**
   * 2) Populate a <select> element with one <option> per text.
   */
  function populateTextDropdown(selectEl, texts) {
    // Reset to a “prompt” option first:
    selectEl.innerHTML = '<option value="">— select a text —</option>';
  
    texts.forEach((entry) => {
      const opt = document.createElement('option');
      opt.value = entry.id;
      opt.textContent = entry.title;
      selectEl.appendChild(opt);
    });
  }
  
  /**
   * 3) When the user chooses a text‐ID from the dropdown, inject that object’s title + content.
   */
  function attachDropdownListener(selectEl, titleEl, contentEl, texts) {
    selectEl.addEventListener('change', () => {
      const chosenId = selectEl.value;
      if (!chosenId) {
        // nothing selected → reset the UI
        titleEl.textContent = 'Select a text to view';
        contentEl.innerHTML = '';
        return;
      }
  
      // find the matching object in the array
      const match = texts.find((obj) => obj.id === chosenId);
      if (!match) {
        titleEl.textContent = 'Text not found';
        contentEl.innerHTML = '';
        return;
      }
  
      // inject title + HTML content
      titleEl.textContent = match.title;
      contentEl.innerHTML = match.content;
    });
  }
  
  /**
   * 4) On DOMContentLoaded, wire everything up only if the two selects exist.
   */
  document.addEventListener('DOMContentLoaded', async () => {
    // If this page doesn’t have #text1-selector, we skip all of the below.
    const select1 = document.getElementById('text1-selector');
    const select2 = document.getElementById('text2-selector');
    if (!select1 || !select2) {
      return;
    }
  
    let texts;
    try {
      texts = await fetchAllTexts();
    } catch (err) {
      console.error(err);
      document.getElementById('text1-content').innerHTML = '<p>Error loading texts.json</p>';
      document.getElementById('text2-content').innerHTML = '<p>Error loading texts.json</p>';
      return;
    }
  
    // Grab the <h2> and content containers
    const title1 = document.getElementById('text1-title');
    const content1 = document.getElementById('text1-content');
    const title2 = document.getElementById('text2-title');
    const content2 = document.getElementById('text2-content');
  
    // Populate each dropdown
    populateTextDropdown(select1, texts);
    populateTextDropdown(select2, texts);
  
    // Attach change‐listeners
    attachDropdownListener(select1, title1, content1, texts);
    attachDropdownListener(select2, title2, content2, texts);
  
    // Optionally: pre‐select the first two entries when the page loads:
    // (uncomment if you want a default view)
    // if (texts.length > 0) {
    //   select1.value = texts[0].id;
    //   select2.value = texts[1] ? texts[1].id : texts[0].id;
    //   select1.dispatchEvent(new Event('change'));
    //   select2.dispatchEvent(new Event('change'));
    // }
  });
  