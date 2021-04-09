const css = /* Css */`
.insta-feed {
  max-width: 300px;
  width: 100%;
  /* background-color: gray; */
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",sans-serif;
  border: 1px solid rgba(58, 58, 58, 0.3);
  border-radius: 5px;
}
.insta-feed-user-info-container {
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  border-bottom: 1px solid rgba(58, 58, 58, 0.3);
  margin-bottom: 2px;
}
.insta-feed-user-img img {
  width: 80px;
  border-radius: 50%;
  margin: 2px;
}
.insta-feed-user-info {
  margin-left: 10px;
}
.insta-feed-user-info h3 {
  margin: 0;
}
.insta-feed-user-info p {
  font-size: 12px;
  margin: 0;
  margin-top: 2px;
}
.insta-feed-follow-button button {
  cursor: pointer;
  border: none;
  outline: none;
  background-color: dodgerblue;
  color: white;
  padding: 5px 15px;
  margin-top: 5px;
  border-radius: 3px;
}
.insta-feed-follow-button button:hover {
  background-color: rgb(0, 106, 212);
}
.insta-feed-user-stats {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border-bottom: 1px solid rgba(58, 58, 58, 0.3);
}
.insta-feed-user-stats div {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: 10px 0;
  text-align: center;
}
.insta-feed-user-stats div h3 {
  margin: 0;
}
.insta-feed-user-stats div p {
  text-align: center;
  margin: 0;
}
.insta-feed-user-posts {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-height: 200px;
  overflow: auto;
  align-items:center;
  justify-content:center;
}
.insta-feed-user-post-single img {
  width: 100%;
  height: 100%;
  vertical-align: top;    
  max-height: 96.99px;
  object-fit: cover;
}
.insta-feed-user-post-single:after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: all 0.3s;
  -webkit-transition: all 0.3s;
}
.insta-feed-user-post-single {
  max-width: 32.33%;
  margin: 1px;
  position: relative;
}
.insta-feed-user-post-single:hover:after {
  opacity: 0.6;
}
`

const template = document.createElement('template')
template.innerHTML = /* html */ `
<style>
${css}
</style>
<div class="insta-feed">
  <div class="insta-feed-user-info-container">
    <div class="insta-feed-user-img">
      <h3>Loading...</h4>
    </div>
    <div class="insta-feed-user-info"></div>
  </div>
  <div class="insta-feed-user-stats"></div>
  <div class="insta-feed-user-posts"></div>
</div>
`

class InstaFeed extends HTMLElement {
    constructor() {
        super();
        // element created
        this._shadowRoot = this.attachShadow({mode: 'open'})
        this._shadowRoot.appendChild(template.content.cloneNode(true))
    }

    connectedCallback() {
        // browser calls this method when the element is added to the document
        // (can be called many times if an element is repeatedly added/removed)
        this.username = this.getAttribute('username')
        this.render()
    }

    async fetchData(username){
//      const res = await fetch(`https://www.instagram.com/${username}/?__a=1`) // Fuck You Instagram CORS
        let url = `https://images${~~(Math.random() * 3333)}-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=${encodeURI(`https://www.instagram.com/${username}/`)}`
        const res = await fetch(url, { method: "GET", mode: "cors", redirect: "follow" })
        const data = await res.text()
        const parsedData = JSON.parse(data.match(new RegExp(/<script type="text\/javascript">window\._sharedData = (.*);<\/script>/))[1]).entry_data.ProfilePage[0];
        return parsedData
    }

    renderPosts(arr = []){
        arr.forEach((data,index)=>{
            this._shadowRoot.querySelector(".insta-feed-user-posts").innerHTML += `
            <a href="https://instagram.com/p/${data.node.shortcode}" target="_blank" class="insta-feed-user-post-single">        
              <div>
                <img src="${data.node.display_url}"/>
              </div>
            </a>`
        })
    }

    renderInformation(user){
        this._shadowRoot.querySelector('.insta-feed-user-img').innerHTML = `
        <img
            src="${user.profile_pic_url}"
            alt="${user.full_name}"
          />
        `
        this._shadowRoot.querySelector('.insta-feed-user-info').innerHTML = `
            <h3>${user.full_name}</h3>
            <p>@${user.username}</p>
            <a class="insta-feed-follow-button" target="_blank" href="https://instagram.com/${user.username}"><button>Follow</button></a>
        `
        this._shadowRoot.querySelector('.insta-feed-user-stats').innerHTML = `
        <div class="insta-feed-user-post-count">
          <h3>${user.edge_owner_to_timeline_media.count.toLocaleString()}</h3>
          <p>Posts</p>
        </div>
        <div class="insta-feed-user-followers">
          <h3>${user.edge_followed_by.count.toLocaleString()}</h3>
          <p>Followers</p>
        </div>
        <div class="insta-feed-user-following">
          <h3>${user.edge_follow.count.toLocaleString()}</h3>
          <p>Following</p>
        </div>
        `
    }

    renderError(err){
      this._shadowRoot.querySelector('.insta-feed-user-img').innerHTML = `
      <h3>404 Not Found</h3>
      `
    }

    async render(){
      try {
        const {graphql} = await this.fetchData(this.username)
        this.renderInformation(graphql.user)
        this.renderPosts(graphql.user.edge_owner_to_timeline_media.edges)   
      } catch (err) {
        this.renderError(err)
        this.render()
      }
    }
}

customElements.define("insta-feed", InstaFeed)
