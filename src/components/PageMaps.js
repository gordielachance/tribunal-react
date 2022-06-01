import { Link } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';
import { useApp } from '../AppContext';
import {getMapUrl} from "./../Constants";
import PageMenu from "./PageMenu";

const PageMaps = (props) => {

  const {mapPosts} = useApp();
  const loading = (mapPosts === undefined);

  return(
    <div id="mapListPage" className="page padding-page">
      <div className="page-content">
        <div className="page-header">
          <h1>Cartes</h1>
          <PageMenu/>
        </div>
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

export default PageMaps
