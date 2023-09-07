import React, { useEffect,useState }  from "react";
import { Link,useParams,useNavigate,useLocation } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';
import PageMenu from "./PageMenu";
import WpPostModal from "./WpPostModal";

const PagePosts = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const loading = (props.posts === undefined);
  const {urlPostId} = useParams();
  const [modalPost,setModalPost] = useState();

  const getPostById = id => {
    return (props.posts || []).find(item => id === item.id);
  }

  useEffect(()=>{

    if (props.posts === undefined) return;

    let post = undefined;
    const postId = parseInt(urlPostId);

    if (postId){
      post = getPostById(postId);
    }

    setModalPost(post);

  },[props.posts,urlPostId])

  const getPageUrl = () => {
    return location.pathname.replace('/'+modalPost?.id, '');
  }

  const handleCloseModal = () => {
    navigate(getPageUrl());
  }

  const getPostUrl = post => {

    if (!post) return;

    //const url = `${getPageUrl()}/${post.id}/${post.slug}`;
    const url = `${getPageUrl()}/${post.id}`;
    return url;
  };

  const handleClick = postId => {
    const post = getPostById(postId);
    if(!post) return;
    navigate(getPostUrl(post));
  }

  return(
    <div id={props.id} className="page posts-page padding-page">
      {
        ( modalPost !== undefined ) &&
        <WpPostModal
        id={modalPost.id}
        title={modalPost.title.rendered}
        onClose={handleCloseModal}
        />
      }
        <div className="page-header">
          <h1>{props.title}</h1>
          <PageMenu/>
        </div>
        {

        <>
          {
            loading ?
            <Loader active />
            :
            <ul className="page-content posts-list">
              {
                //TOUFIX URGENT HANDLE NO POSTS
                (props.posts || []).map((post,key) => {

                  return(
                    <li post_id={post.id} key={post.id}>
                      <div className="post-thumbnail clickable" onClick={()=>handleClick(post.id)}>
                        {
                          post.thumbnail_url &&
                          <img alt='' src={post.thumbnail_url} className="cover-img"/>
                        }
                      </div>
                      <div className="post-details">
                        <h3 className="post-title clickable" onClick={()=>handleClick(post.id)}>{post.title.rendered}</h3>
                        <div className="post-excerpt">
                          {post.excerpt.rendered}
                        </div>
                      </div>
                    </li>
                  )

                })
              }
            </ul>
          }

        </>
        }
    </div>
  )
}

export default PagePosts
