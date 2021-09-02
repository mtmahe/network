document.addEventListener('DOMContentLoaded', function() {


  load_dashboard('profile');
});

function load_dashboard(posts_type) {

  // Log posts name
  let title = return_title(posts_type);
  console.log(title);

  // Show the dashboard name
  document.querySelector('#title').innerHTML = `<h3>${title}</h3>`;

  createPostsView('1');

  //  Create the posts view
  function createPostsView(currentPageNumber) {
    console.log(`posts type is ${posts_type}`)
    fetch('/posts', {
      method: 'GET',
      headers: {
        'authors': 'all',
      },
    })
    .then(response => response.json())
    .then(my_pages => {
      const currentPage = my_pages.pages[currentPageNumber];
      const numPages = my_pages.num_pages;
      const hasNext = currentPage.has_next;
      const hasPrevious = currentPage.has_previous;
      currentPage.page_list.forEach(append_post_node);

      // Create the individual post containers and append to view
      function append_post_node(item) {
        // Select element to update
        const element = document.getElementById('paginate-posts');

        // create container for each post
        var next_post = document.createElement('div');
        next_post.setAttribute('class',
        'section-container');

        // Add post to container
        const owner = document.createElement('strong');
        node = document.createTextNode(item.owner);
        owner.append(node)
        next_post.appendChild(owner);

        const body = document.createElement('p');
        node = document.createTextNode(item.body);
        body.append(node)
        next_post.appendChild(body);

        const timestamp = document.createElement('small');
        node = document.createTextNode(item.timestamp);
        timestamp.append(node)
        next_post.appendChild(timestamp);

        const likes = document.createElement('p');
        node = document.createTextNode('Likes');
        likes.append(node)
        next_post.appendChild(likes);


        element.appendChild(next_post);
      }

      // Set pagination middle value.
      document.querySelector('#btn-current').innerHTML = 'page ' + currentPageNumber + ' of ' + numPages;
      leftButton.currentPageNumber = currentPageNumber;
      rightButton.currentPageNumber = currentPageNumber;

      // make page buttons dissapear if not applicable.
      if (hasNext) {
        document.querySelector('#btn-next').style.display = 'block';
      } else {
        document.querySelector('#btn-next').style.display = 'none';
      };
      if (hasPrevious) {
        document.querySelector('#btn-previous').style.display = 'block';
      } else {
        document.querySelector('#btn-previous').style.display = 'none';
      };
    })
  }

  //let currentPageNumber = document.querySelector('#btn-current').innerHTML;
  //console.log(`After post page number is ${currentPageNumber}`);

  // Create and add pagination nav
  const leftButton = document.querySelector('#btn-previous');
  leftButton.addEventListener('click', pageChange, false);
  leftButton.amount = -1;

  const rightButton = document.querySelector('#btn-next');
  rightButton.addEventListener('click', pageChange, false);
  rightButton.amount = 1;



  function pageChange(evt) {

    //clear element
    const element = document.getElementById('paginate-posts');
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    var currentPageNumber = String(parseInt(evt.currentTarget.currentPageNumber) + evt.currentTarget.amount);

    console.log(currentPageNumber);

    // load the selected page
    //load_dashboard('all_posts', currentPageNumber);
    createPostsView(currentPageNumber);
  }
}


function return_title(name) {
  // Return the title given name.

  const names = {
    all_posts: 'All posts',
    profile: 'Profile',
    following: 'Following',
  };

  return names[name];
}
