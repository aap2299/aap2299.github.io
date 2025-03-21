

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
                    data-language="${manuscript.language}"
                    data-provenance="${manuscript.provenance}"
                    data-origin="${manuscript.origin}" 
                    data-composite="${manuscript.composite}"
                    data-index="${manuscript.index}"> 



                    <h3><a target="blank" href="manuscript.html?id=${index}" style="color: ${titleColor}; text-decoration: none;">${manuscript.shelfmark}</a></h3>
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
                    <h2>${manuscript.shelfmark}</h2>
                    <p><strong>Date:</strong> ${manuscript.date}</p>
                    <p><strong>Country:</strong> ${manuscript.location}</p> 
                    <p><strong>Library:</strong> ${manuscript.library}</p>
                    <p><strong>Language:</strong> ${manuscript.language}</p>
                    <p><strong>Online Catalogue Entry:</strong> <a class="view-record-button" href="${manuscript.onlineRecord}" target="_blank">View</a></p>


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
                        <p><strong>Composite:</strong> ${manuscript.composite === "yes" ? "Yes" : "No"}</p>
                         ${manuscript.composite === "yes" && manuscript.texts && manuscript.texts.length > 0 ? `
        
            <button  class="more-details-btn" onclick="this.nextElementSibling.classList.toggle('hidden')">Also Contains <span>&#9660;</span></button>
        <div class="composite-details hidden">
            <ul>
                ${manuscript.texts.map(text => `<li>${text}</li>`).join('')}
            </ul>
        </div>
    ` : ''}
                        <p><strong>Index:</strong> ${manuscript.index === "yes" ? "Yes" : "No"}</p>
                         ${manuscript.index === "yes" ? `
                                <ul>
                                    ${manuscript.indexType && manuscript.indexType.length > 0 ? 
                                        manuscript.indexType.map(type => `<li>${type}</li>`).join('') : 
                                        `<li>No specific reasons available</li>`}
                                </ul>
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

               
                
                




                
                
            // add mirador and IIIF button if manifest is present in json file
            if (manuscript.compatibleWithMirador) {
                content += `
                    <p>
                        <a href="mirador.html?manifestId=${manuscript.manifestId}" target="_blank" class="button">Open in Mirador</a>
                        <a href="${manuscript.manifestId}" target="_blank" class="buttoniiif" style="text-decoration: none;">
                            <img src="images/iiif_notext.png" alt="IIIF Logo" style="width: 40px; height: auto; vertical-align: middle;"/> 
                        </a>
                    </p>`;
}


              // sets HTML content for chosen ms

                content += `<p><a href="manuscripts.html" class="button">Return to Manuscript List</a></p>`;

                 // Manuscript image at the bottom
                const imageUrl = manuscript.imageUrl || 'default_image.jpg'; // Fallback to a default image if not provided
                content += `
                    <img class="manuscript-image" src="${imageUrl}" alt="Image of ${manuscript.shelfmark}" 
                    <p><strong>Image Credit:</strong> ${manuscript.imageCredit}</p>
                    <p><strong></strong> ${manuscript.license}</p>
                    <p><strong></strong> ${manuscript.URN}</p>
                `;



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
                galleryItem.setAttribute('data-language', manuscript.language);
                galleryItem.setAttribute('data-composite', manuscript.composite);



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
            const languageFilter = document.getElementById('filter-language').value;
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
                const language = galleryItem.getAttribute('data-language');
                const composite = galleryItem.getAttribute('data-composite');
        
                const matchesshelfmark = shelfmark.includes(shelfmarkFilter);
                const matchesPlace = placeFilter === '' || place === placeFilter;
                const matchesDate = dateFilter === '' || date === dateFilter;
                const matchesDigitised = digitisedFilter === '' || digitised === digitisedFilter;
                const matchesComplete = completeFilter === '' ||  (complete && complete.toLowerCase() === completeFilter);
                const matchesGroup = groupFilter === '' || group === groupFilter;
                const matchesLanguage = languageFilter === '' || language === languageFilter;
                const matchesComposite = compositeFilter === '' || composite === compositeFilter;
        
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
document.getElementById('filter-language')?.addEventListener('change', filterGallery);
document.getElementById('filter-digitised')?.addEventListener('change', filterGallery);
document.getElementById('filter-complete')?.addEventListener('change', filterGallery);
document.getElementById('filter-group')?.addEventListener('change', filterGallery);
document.getElementById('filter-composite')?.addEventListener('change', filterGallery);


// Clear filters button logic
document.getElementById("clear-filters")?.addEventListener("click", function() {
    document.getElementById("filter-place").selectedIndex = 0;
    document.getElementById("filter-date").selectedIndex = 0;
    document.getElementById("filter-language").selectedIndex = 0;
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
// Function to load text based on the selected ID and chapter
function loadText(textIdWithChapter, selectorId, texts) {
    const [textId, chapterId] = textIdWithChapter.split(':');  // Split into textId and chapterId
    console.log(`Loading text: ${textId} (Chapter: ${chapterId}) for selector: ${selectorId}`);

    const text = texts.find(item => item.id === textId);  // Find the text by its ID
    if (text) {
        const chapter = text.chapters.find(ch => ch.chapter === chapterId); // Find the specific chapter
        if (chapter) {
            console.log('Chapter found:', chapter);
            document.getElementById(`${selectorId}-title`).innerText = text.title;
            document.getElementById(`${selectorId}-content`).innerHTML = chapter.content;
        } else {
            console.log('Chapter not found:', chapterId);
        }
    } else {
        console.log('Text not found for ID:', textId);
    }
}

// Function to populate a dropdown with manuscripts and their chapters
function populateDropdown(selectorId, manuscripts) {
    const dropdown = document.getElementById(selectorId);
    
    manuscripts.forEach(manuscript => {
        // Create an optgroup for each manuscript
        const optgroup = document.createElement('optgroup');
        optgroup.label = manuscript.title;

        // Add chapters as options under the manuscript
        manuscript.chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = `${manuscript.id}:${chapter.chapter}`; // Unique identifier for manuscript and chapter
            option.textContent = chapter.chapter; // Display the chapter
            optgroup.appendChild(option);
        });

        // Append the optgroup to the dropdown
        dropdown.appendChild(optgroup);
    });
}

// Fetch texts and populate dropdowns
fetch('./texts.json')
    .then(response => response.json())
    .then(data => {
        const texts = data;  // All text data, including manuscripts

        // Debugging: Ensure data is loaded correctly
        console.log('Texts loaded:', texts);

        // Populate the dropdowns with the manuscript data
        populateDropdown('text1-selector', texts);
        populateDropdown('text2-selector', texts);

        // Load initial content when the page loads
        window.onload = function () {
            console.log('Page loaded. Loading initial content...');
            loadText('text1:1.1.1', 'text1', texts);  // Load initial content for text1, chapter 1.1.1
            loadText('text2:2.1.1', 'text2', texts);  // Load initial content for text2, chapter 2.1.1
        };

        // Event listener for the dropdown in the first text box
        document.getElementById('text1-selector').addEventListener('change', function () {
            const selectedText = this.value.split(':')[0];  // Get the selected manuscript's ID
            console.log('Dropdown 1 selected:', selectedText);
            loadText(this.value, 'text1', texts);  // Pass the full value (manuscript ID and chapter)
        });

        // Event listener for the dropdown in the second text box
        document.getElementById('text2-selector').addEventListener('change', function () {
            const selectedText = this.value.split(':')[0];  // Get the selected manuscript's ID
            console.log('Dropdown 2 selected:', selectedText);
            loadText(this.value, 'text2', texts);  // Pass the full value (manuscript ID and chapter)
        });

    })
    .catch(error => console.error('Error loading texts:', error));



    // chapter page 

  // Function to fetch and load the books and chapters from the JSON file
fetch('book.json')
.then(response => response.json())
.then(data => {
    const booksList = document.getElementById('books-list');
    const chapterContent = document.getElementById('chapter-content');

    // Loop through each book
    data.books.forEach(book => {
        // Create a dropdown for each book
        const bookDiv = document.createElement('div');
        const bookDropdown = document.createElement('button');
        bookDropdown.textContent = `Book ${book.book_number}`;
        bookDropdown.classList.add('book-dropdown');

        // Create a container for the parts in this book
        const partContainer = document.createElement('div');
        partContainer.style.display = 'none';  // Hide parts initially

        // Loop through each part in the book
        book.parts.forEach(part => {
            const partDropdown = document.createElement('button');
            partDropdown.textContent = `Part ${part.part}`;
            partDropdown.classList.add('part-dropdown');

            // Create a container for the chapters in this part
            const chapterContainer = document.createElement('div');
            chapterContainer.style.display = 'none';  // Hide chapters initially

            // Loop through each chapter in the part
            part.chapters.forEach(chapter => {
                const chapterLink = document.createElement('a');
                chapterLink.href = "#";
                chapterLink.textContent = chapter.chapter_title; // Only show chapter title

                // When a chapter title is clicked, load the chapter content dynamically
                chapterLink.addEventListener('click', function() {
                    chapterContent.innerHTML = `
                        <h2>${chapter.chapter_title}</h2>
                        <p>${chapter.chapter_text}</p>
                    `;
                });

                // Append chapter link to the chapter container
                chapterContainer.appendChild(chapterLink);
                chapterContainer.appendChild(document.createElement('br')); // Add line break
            });

            // Toggle the visibility of the chapters when the part is clicked
            partDropdown.addEventListener('click', function() {
                const isVisible = chapterContainer.style.display === 'block';
                chapterContainer.style.display = isVisible ? 'none' : 'block';
            });

            // Append the part dropdown and chapter container to the part container
            partContainer.appendChild(partDropdown);
            partContainer.appendChild(chapterContainer);
        });

        // Toggle the visibility of the parts when the book is clicked
        bookDropdown.addEventListener('click', function() {
            const isVisible = partContainer.style.display === 'block';
            partContainer.style.display = isVisible ? 'none' : 'block';
        });

        // Append the book dropdown and part container to the page
        bookDiv.appendChild(bookDropdown);
        bookDiv.appendChild(partContainer);
        booksList.appendChild(bookDiv);
    });
})
.catch(error => {
    console.error('Error loading JSON data:', error);
});

    

