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
  const [modalPostId,setModalPostId] = useState();

  useEffect(()=>{
    setModalPostId(urlPostId);
  },[urlPostId])

  const handleCloseModal = () => {
    const url = location.pathname.replace('/'+modalPostId, '');
    navigate(url);
  }

  return(
    <div id={props.id} className="page posts-page padding-page">
      {
        ( modalPostId !== undefined ) &&
        <WpPostModal
        postId={modalPostId}
        onClose={handleCloseModal}
        />
      }
      <div className="page-content">
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
            <ul className="posts-list">
              {
                (props.posts || []).map((post,key) => {

                  const post_url = post.guid.react.replace(window.location.origin, "");

                  return(
                    <li post_id={post.id} key={post.id}>
                      <div className="post-thumbnail">
                        {
                          post.featured_media_url &&
                          <img alt='' src={post.featured_media_url} className="cover-img"/>
                        }
                      </div>
                      <div className="post-details">
                        <h3 className="post-title">
                          <Link to={post_url}>{post.title.react}</Link>
                        </h3>
                        <div>
                          {post.excerpt.react}
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
    </div>
  )
}

export default PagePosts
