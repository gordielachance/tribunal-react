import { Link } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';
import { useApp } from '../AppContext';
import {getMapUrl} from "./../Constants";

const MapListPage = (props) => {

  const {mapPosts} = useApp();
  const loading = (mapPosts === undefined);

  return(
    <div id="mapListPage" className="page horizontal-page padding-page">
      <div className="page-content">
        <h1>MAPS LIST</h1>
        {

        <>
          {
            loading ?
            <Loader active />
            :
            <ul>
              {
                (mapPosts || []).map((post,key) => {
                  return(
                    <li key={post.id}>
                      <h2><Link to={getMapUrl(post.id,post.slug)}>{post.title.react}</Link></h2>
                      <div>
                        {post.excerpt.react}
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

export default MapListPage
