////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext } from 'react';
import DatabaseAPI from "./databaseAPI/api";
import {DEBUG} from "./Constants";
import useWindowDimensions from './components/ScreenSize';

const AppContext = createContext();

export function AppProvider({children}){

	const screenSize = useWindowDimensions();
  const [verticalScreen,setVerticalScreen] = useState();
  const [mobileScreen,setMobileScreen] = useState();

	const [tags,setTags] = useState();
	const [categories,setCategories] = useState();
	const [hasInit,setHasInit] = useState(false);
	const [homePost,setHomePost] = useState();
	const [creditsPost,setCreditsPost] = useState();
  const [mapPosts,setMapPosts] = useState();
	const [creationPosts,setCreationPosts] = useState();
	const [agendaPosts,setAgendaPosts] = useState();

	const getTagsFromSlugs = slugs => {
		return (slugs||[]).map(slug=>{
			return (tags || []).find(item => item.slug === slug);
		})
	}

	const getCategoriesFromSlugs = slugs => {
		return (slugs||[]).map(slug=>{
			return (categories || []).find(item => item.slug === slug);
		})
	}

	//check is vertical
  useEffect(()=>{
    const isVertical = screenSize.height > screenSize.width;
    const isMobile = screenSize.width <= 576;
    setVerticalScreen(isVertical);
    setMobileScreen(isMobile);
  },[screenSize]);

	//initialize data
	useEffect(() => {
	  // Define an asynchronous function to fetch data

		let isSubscribed = true;

	  async function fetchData() {
	    try {
	      const tags = await DatabaseAPI.getItems('tags');
				setTags(tags.data);

	      const categories = await DatabaseAPI.getItems('categories');
				setCategories(categories.data);

	      // Once the data is loaded, set the 'hasInit' state to true
	      setHasInit(true);

	    } catch (error) {
	      // Handle any errors that occur during data fetching
	      console.error('Error fetching data:', error);
	    }
	  }

		if (isSubscribed) {
	  	fetchData();
		}

		//clean up fn
		return () => isSubscribed = false;

	}, []);

	useEffect(() => {
		if (!hasInit) return;
		console.info('***APP DATA READY***');
		console.log(tags);
		console.log(categories);
	}, [hasInit]);


	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {
    tags,
		getTagsFromSlugs,
		categories,
		getCategoriesFromSlugs,
		homePost,
		setHomePost,
		creditsPost,
		setCreditsPost,
    mapPosts,
		setMapPosts,
		creationPosts,
		setCreationPosts,
		agendaPosts,
		setAgendaPosts,
		mobileScreen,
		verticalScreen
	};

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a AppProvider')
  }
  return context
}
