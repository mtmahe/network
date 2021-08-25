document.addEventListener('DOMContentLoaded', function() {

  // Use buttons

  load_dashboard('all_posts');
});

function load_dashboard(posts_type) {
  // Log posts name
  let title = return_title(posts_type);
  console.log(title);

  // Show the dashboard and hide the others
  document.querySelector('#new-post-view').style.display = 'block';
  document.querySelector('#posts-view').style.display = 'block';

  // Show the dashboard name
  document.querySelector('#title').innerHTML = `<h3>${title}</h3>`;

  // Create the new post view
  document.querySelector('#new-post-body').value = '';

  // Submit new post
  document.querySelector('form').onsubmit = () => {
    console.log('submitting');
    fetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
        body: document.querySelector('#new-post-body').value,
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      load_dashboard('all_posts');
    })

    return false;
  }

  //  Create the posts view
  fetch('/posts/all')
  .then(response => response.json())
  .then(posts => {

    posts.forEach(append_post_node);

    function append_post_node(item) {
      // Select element to update
      const element = document.getElementById('posts-view');

      // create container for each post
      var next_post = document.createElement('div');
      next_post.setAttribute('class',
      'next_post_div');

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
  })
}


function return_title(name) {
  // Return the title given name.

  const names = {
    all_posts: 'All posts',
    following: 'Following',
  };

  return names[name];
}
