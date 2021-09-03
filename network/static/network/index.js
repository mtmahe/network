document.addEventListener('DOMContentLoaded', function() {

  // Layout buttons
  let user_pk = document.getElementById('user-profile-link').getAttribute('value');
  //console.log(user_pk);
  document.querySelector('#user-profile-link').addEventListener('click', () => load_dashboard(user_pk));
  document.querySelector('#following-link').addEventListener('click', () => load_dashboard('following'));

  load_dashboard('all_posts');
});

function load_dashboard(posts_type) {
  // Note: posts_type will be the owner_pk for Profile views.

  //console.log(`posts type dash ${posts_type}`)
  // Log posts name
  let title = return_title(posts_type);
  //console.log(`title ${title}`)

  // Show the dashboard and hide the others
  if (title == 'All posts') {
    document.querySelector('#new-post-view').style.display = 'block';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
  } else if (title == 'Profile') {
    document.querySelector('#new-post-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'block';
    createProfileView(posts_type);
  } else if (title == 'Following') {
    document.querySelector('#new-post-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
  }


  // Show the dashboard name
  document.querySelector('#title').innerHTML = `<h3>${title}</h3>`;

  // Create the new post view
  document.querySelector('#new-post-body').value = '';

  // Submit new post
  document.querySelector('form').onsubmit = () => {
    console.log('submitting');
    fetch('/posts/compose', {
      method: 'POST',
      body: JSON.stringify({
        body: document.querySelector('#new-post-body').value,
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(`result ${result}`);
      load_dashboard('all_posts');
    })

    return false;
  }


  function createProfileView(posts_type) {
    // Follows Count
    fetch(`/profile/follows/${posts_type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authors': posts_type,
      },
    })
    .then(response => response.json())
    .then(result => {
      document.getElementById('follower-count').innerHTML = `Following ${result}`;
    })
    // Following count
    fetch(`/profile/followers/${posts_type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authors': posts_type,
      },
    })
    .then(response => response.json())
    .then(result => {
      document.getElementById('following-count').innerHTML = `Followers ${result}`;
    })
    // Follow button
    let user_pk = document.getElementById('user-profile-link').getAttribute('value');
    if (posts_type != user_pk) {
      document.querySelector('#follow-button').style.display = 'block';
      document.querySelector('#follow-button').addEventListener('click', () => followClick());
    } else {
      document.querySelector('#follow-button').style.display = 'none';
    };
  };

  createPostsView('1', posts_type);

  //  Create the posts view
  function createPostsView(currentPageNumber, posts_type) {
    console.log(`posts type is ${posts_type}`)
    fetch('/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authors': posts_type,
      },
    })
    .then(response => response.json())
    .then(my_pages => {
      // First, clear posts if there are any.
      const element = document.getElementById('paginate-posts');
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      };
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
        owner.addEventListener('click', function() {
          load_dashboard(item.owner_pk)
          //window.location.href=`/profile/${item.owner_pk}`;
        })

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
    createPostsView(currentPageNumber, posts_type);
  }
}


function return_title(name) {
  // Return the title given name.
  if (name != 'all_posts' && name != 'following') {
    name = 'profile';
  };

  const names = {
    all_posts: 'All posts',
    profile: 'Profile',
    following: 'Following',
  };

  return names[name];
}


function followClick() {

}
