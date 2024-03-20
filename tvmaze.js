"use strict";

// selecting DOM elements using jQuery
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

// function to fetch TV shows by search term
async function getShowsByTerm(term) {
  try {
    // making a GET request to the TVMaze API
    const response = await axios.get(
      `https://api.tvmaze.com/search/shows?q=${term}`
    );
    // getting show data from the response and formatting it
    const shows = response.data.map((entry) => {
      const showData = entry.show;
      // Checking if the image is available
      const image = showData.image
        ? showData.image.medium
        : "https://tinyurl.com/tv-missing";
      // Returning formatted show object
      return {
        id: showData.id,
        name: showData.name,
        summary: showData.summary,
        image: image,
      };
    });
    // Returning the array of formatted show objects
    return shows;
  } catch (error) {
    // Handling errors if API request fails
    console.error("Error fetching shows:", error);
    return [];
  }
}

// Function to populate the DOM with TV shows
function populateShows(shows) {
  // Clearing the existing shows list
  $showsList.empty();

  // Iterating through each show and creating markup for display
  for (let show of shows) {
    const $show = $(`
      <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
        <div class="media">
          <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
          <div class="media-body">
            <h5 class="text-primary">${show.name}</h5>
            <div><small>${show.summary}</small></div>
            <button class="btn btn-outline-light btn-sm Show-getEpisodes">
              Episodes
            </button>
          </div>
        </div>
      </div>
    `);

    // Appending the show markup to the shows list
    $showsList.append($show);
  }
}

// handling form submission and display search results
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  // Fetching shows based on the search term
  const shows = await getShowsByTerm(term);
  // Hiding episodes area and populating the shows list
  $episodesArea.hide();
  populateShows(shows);
}

// Event listener for form submission to trigger show search and display
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

// Function to fetch episodes for a specific show ID from the TVMaze API
async function getEpisodes(showId) {
  try {
    // Making a GET request to the TVMaze API to fetch episodes
    const response = await axios.get(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    // Extracting episode data from the response and formatting it
    return response.data.map((episode) => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    }));
  } catch (error) {
    // Handling errors if API request fails
    console.error("Error fetching episodes:", error);
    return [];
  }
}

// Function to populate the DOM with episodes for a specific show
function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");
  // Clearing the existing episodes list
  $episodesList.empty();

  // Iterating through each episode and creating markup for display
  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`
    );
    // Appending the episode markup to the episodes list
    $episodesList.append($episode);
  }

  // Showing the episodes area after populating episodes
  $episodesArea.show();
}

// Event listener for episodes button clicks to fetch and display episodes
$(document).on("click", ".Show-getEpisodes", async function () {
  // getting the show ID from the clicked button's data attribute
  const showId = $(this).closest(".Show").data("show-id");
  // Fetching episodes for the selected show ID
  const episodes = await getEpisodes(showId);
  // Populating the DOM with episodes
  populateEpisodes(episodes);
});
