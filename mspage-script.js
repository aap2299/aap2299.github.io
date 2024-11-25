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
                        <p><strong>Description:</strong> ${manuscript.description}</p>
               
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
