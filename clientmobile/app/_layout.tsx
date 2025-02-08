
import { Alert, Button, StyleSheet, Text, View, Dimensions} from 'react-native';
import 'react-native-reanimated';
import { UIButton } from './components/UIButton';
import { useEffect, useState } from 'react';
import { Article, articleCategories, ArticleCategory, blobUrl } from './data';
import { getArticle, getArticlePreviewsByCategory } from './api';
import SoundPlayer, { SoundPlayerEventData } from 'react-native-sound-player'


enum ReadingState {
  PRESTART = "Prestart",
  PREVIEW = "Preview",
  PAUSED = "Paused",
  PLAYING = "Playing",
}

export default function RootLayout() {

  const [state, __setState] = useState<ReadingState>(ReadingState.PRESTART);
  const setState = (newState: ReadingState) => {
    console.log("State: " + newState);
    __setState(newState);
  }

  const playUrl = (url: string) => {
    console.log("Playing: " + url);
    SoundPlayer.playUrl(url);
  }

  const [articles, setArticles] = useState<Article[]>([]);
  const [currentCategory, setCurrentCategory] = useState<ArticleCategory>(articleCategories[0]);
  const [categoryPointers, setCategoryPointers] = useState<{ [key: string]: number }>({});
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const currentArticle = () => articles[currentArticleIndex];

  const nextCategory = async () => {
    SoundPlayer.pause();
    setCategoryPointers({ ...categoryPointers, [currentCategory]: currentArticleIndex + 1}); // !OR +1
    // ^ the or +1 is up to personal preference, doesnt need to be there
    // w/ +1 : the next time the category is selected, the next article will be read
    // w/o +1 : the same article will be read again that we ended the category on

    let index = articleCategories.indexOf(currentCategory);
    let articles: Article[] = []; // advances the next category and skips over empty categories
    while (articles.length == 0) {
      index = (index + 1) % articleCategories.length;
      const nextCategory = articleCategories[index];
      setCurrentCategory(nextCategory);
      setCurrentArticleIndex(categoryPointers[nextCategory] || 0);
      articles = await getArticlePreviewsByCategory(nextCategory);
      console.log("Switching to category: " + nextCategory);
    }

    setArticles(articles);
    setState(ReadingState.PRESTART);
  }

  const nextArticle = () => {
    const nextIndex = (currentArticleIndex + 1) % articles.length;
    setCurrentArticleIndex(nextIndex);
    return articles[nextIndex];
  }

  const onFinishedPlaying = ({success}: SoundPlayerEventData) => {
    console.log("Finished playing audio");
    if (success) {
      // advance to the next article in the category
      console.log(state);

      if (state == ReadingState.PLAYING) {
        setTimeout(() => cancelBtn(), 2000);
      }
    }
  }

  const [pageLoaded, setPageLoaded] = useState(false); // lock to prevent multiple fetches

  useEffect(() => {
    // componentWillMount space

    const onFinishedPlayingSub = SoundPlayer.addEventListener('FinishedPlaying', onFinishedPlaying);

    const onFinishedLoadingSub = SoundPlayer.addEventListener('FinishedLoadingURL', ({success, url}) => {
      if (!success) {
        console.error("Failed to load audio URL: " + url);
      } else {
        console.log("Finished loading audio URL: " + url);
      }
    });

    if (!pageLoaded) {
      getArticlePreviewsByCategory(currentCategory).then(s => setArticles(s));
      setPageLoaded(true);
    }

    return () => {
      // componentWillUnmount space
      onFinishedPlayingSub.remove();
      onFinishedLoadingSub.remove();
    }
  }, [setArticles, articles, setPageLoaded, pageLoaded])

  const cancelBtn = () => {
    if (state == ReadingState.PLAYING || state == ReadingState.PAUSED
      || state == ReadingState.PREVIEW) {
 
      SoundPlayer.pause();
      // advance to the next article in the category

      playUrl(blobUrl(nextArticle(), 'title'));
      setState(ReadingState.PREVIEW);
    }
  }

  const pauseBtn = () => {
    if (state == ReadingState.PLAYING) {
      // pause reading the article
      SoundPlayer.pause();
      setState(ReadingState.PAUSED);
    }
    // pause could be joined in state with play
    // and the same control could be used for both
  }

  const playBtn = () => {
    if (state == ReadingState.PRESTART) {

      console.log("Playing category" + currentCategory);
      // being reading the preview of the first article
      playUrl(blobUrl(currentArticle(), 'title'));
      setState(ReadingState.PREVIEW);
    }

    if (state == ReadingState.PREVIEW) {
      // start reading the article
      playUrl(blobUrl(currentArticle(), 'content'));
      setState(ReadingState.PLAYING);
    }

    if (state == ReadingState.PAUSED) {
      // resume reading the article from the last position
      SoundPlayer.resume();
      setState(ReadingState.PLAYING);
    }
  }

  const miscAction = () => {
    playUrl("https://helpamdstorage.blob.core.windows.net/tts/5-things-to-know-for-jan-8-california-wildfires-winter-storm-trump-transition-cybertruck-explosion-meta-content.wav");
  }

  return (
    <View style={styles.container}>
      <View>
        {/* <Text style={styles.title}>AMD Assistant</Text> */}
        {/* <View style={styles.separator} /> */}
  {/* ----- LEGACY UI ----- */}
        {/* <View style={styles.inLine}>
          <UIButton text="I forgot" color="blue" width={48.5}
            onclick={miscAction} />
          <UIButton text="Category" color="blue" width={48.5}
            onclick={nextCategory} />
        </View>
        <View style={styles.separator} />
        <View style={styles.inLine}>
          <UIButton text="Cancel" color="red" width={30}
            onclick={cancelBtn} />
          <UIButton text="Pause" color="orange" width={30}
            onclick={pauseBtn} />
          <UIButton text="Play" color="green" width={30}
            onclick={playBtn} />

        </View> */}

  {/* ----- MICROSOFT UI ----- */}
     
        <View style={styles.inLine}>
          <UIButton text="Cancel" color="red" width={48.5}
            onclick={cancelBtn} />
          <UIButton text="Play" color="green" width={48.5}
            onclick={playBtn} />
        </View>

        {/* <View style={styles.separator} /> */}

        <View style={styles.inLine}>
          <UIButton text="Pause" color="orange" width={48.5}
            onclick={pauseBtn} />
          <UIButton text="Category" color="blue" width={48.5}
            onclick={nextCategory} />
        </View>


      </View>
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // width: "100%",
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  inLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 32,
    borderBottomColor: '#737373',
  },
});
