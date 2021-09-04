document.addEventListener('DOMContentLoaded', function() {

  // Layout buttons
  //let user_pk = 3;

  if (document.getElementById('user-profile-link')) {
    //console.log('true');
    let user_pk = document.getElementById('user-profile-link').getAttribute('value');
    document.querySelector('#user-profile-link').addEventListener('click', () => load_dashboard(user_pk));
    document.querySelector('#following-link').addEventListener('click', () => load_dashboard('following'));
  } else {
    //console.log('false');
  };


  load_dashboard('all_posts');
});

function load_dashboard(posts_type) {
  // Note: posts_type will be the owner_pk for Profile views.

  //let user_pk = document.getElementById('user-profile-link').getAttribute('value');
  //document.querySelector('#user-profile-link').addEventListener('click', () => load_dashboard(user_pk));
  //document.querySelector('#following-link').addEventListener('click', () => load_dashboard('following'));


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
      document.getElementById('follower-count').innerHTML = `Following ${result.length}`;
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
      let followingList = [];
      //console.log(`result is ${result.following_total}, length is ${followingList.length}`);
      followingList = result.following_total;
      //console.log(`follow list updated to ${followingList}, length is ${followingList.length}`);
      document.getElementById('following-count').innerHTML = `Followers ${followingList.length}`;
      // Follow button
      let user_pk = 0;
      if (document.getElementById('user-profile-link')) {
        user_pk = document.getElementById('user-profile-link').getAttribute('value');
      };

      // check if profile is current users, then they don't see follow button.
      if (posts_type != user_pk) {
        document.querySelector('#follow-button').style.display = 'block';

        // check if user is currently following profile owner and set button content.
        if (followingList == user_pk || followingList.includes(user_pk)) {
          console.log('in li');
          console.log(`innerHTML is ${document.getElementById('follow-button').innerHTML}`);
          document.getElementById('follow-button').innerHTML = 'Unfollow';
          console.log(`innerHTML is now ${document.getElementById('follow-button').innerHTML}`);
        } else {
          console.log('not');
        };

        // event listener for follow button.
        let wasFollowing = true;
        if (document.getElementById('follow-button').innerHTML == 'Follow') {
          wasFollowing = false;
        };
        document.querySelector('#follow-button').addEventListener('click', () => followClick(posts_type, followingList.length, wasFollowing));
      } else {
        document.querySelector('#follow-button').style.display = 'none';
      };
    })
  };

  createPostsView('1', posts_type);

  //  Create the posts view
  function createPostsView(currentPageNumber, posts_type) {
    //console.log(`posts type is ${posts_type}`)
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
        const owner = document.createElement('div');
        node = document.createTextNode(item.owner);
        owner.append(node);
        owner.setAttribute('class', 'post-owner-link');
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


function followClick(followed, length, wasFollowing) {
  console.log('follow function')
  fetch('/profile/follow', {
    method: 'POST',
    body: JSON.stringify({
      'followed': followed,
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log({result});
    // Toggle follow button message
    if (document.getElementById('follow-button').innerHTML == 'Follow') {
      document.getElementById('follow-button').innerHTML = 'Unfollow';

      // only toggle length if this is original change, if not go back to original.
      if (!wasFollowing) {
        length++;
      }
      document.getElementById('following-count').innerHTML = `Followers ${length}`;
    } else {
      document.getElementById('follow-button').innerHTML = 'Follow';

      // only toggle length if this is original change, if not go back to original.
      if (wasFollowing) {
        length--;
      };
      document.getElementById('following-count').innerHTML = `Followers ${length}`;
    };
  })
}
