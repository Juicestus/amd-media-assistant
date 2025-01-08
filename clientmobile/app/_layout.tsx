
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import { ttsSpeak, ttsInit, ttsEvent, ttsStop } from './tts';
import { UIButton } from './components/UIButton';
import { useEffect, useState } from 'react';
import { Article, articleCategories, ArticleCategory } from './data';
import { getArticle, getArticlePreviewsByCategory } from './api';

enum ReadingState {
  PRESTART = "Prestart",
  LOADING = "Loading",
  PREVIEW = "Preview",
  PAUSED = "Paused",
  PLAYING = "Playing",
}

export default function RootLayout() {

  ttsInit();

  const [remainingText, setRemainingText] = useState<string>("");

  

  const [currentArticle, setCurrentArticle] = useState<Article>({
    id: '',
    url: '',
    site: '',
    title: '',
    category: 'news',
    content: '',
    timestamp: 0
  });
  const [articlePreviews, setArticlePreviews] = useState<Article[]>([]);
  const [currentCategory, setCurrentCategory] = useState<ArticleCategory>(articleCategories[0]);

  const nextCategory = () => {
    const currentIndex = articleCategories.indexOf(currentCategory);
    const nextIndex = (currentIndex + 1) % articleCategories.length;
    setCurrentCategory(articleCategories[nextIndex]);
    getArticlePreviewsByCategory(articleCategories[nextIndex]).then(s => setArticlePreviews(s));
  }

  useEffect(() => {
    getArticlePreviewsByCategory(currentCategory).then(s => setArticlePreviews(s));
  }, [setArticlePreviews])

  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [state, __setState] = useState<ReadingState>(ReadingState.PRESTART);

  const setState = (newState: ReadingState) => {
    console.log("State: " + newState);
    __setState(newState);
  }

  const nextArticleIndex = () => {
    const nextIndex = (currentArticleIndex + 1) % articlePreviews.length;
    setCurrentArticleIndex(nextIndex);
    return nextIndex;
  }

  const loadArticle = (index: number) => {
    const id = encodeURIComponent(articlePreviews[index].id);
    getArticle(id).then(a => {
      setCurrentArticle(a);

      // start reading the preview
      ttsSpeak(a.title);
      setState(ReadingState.PREVIEW);
    });
  }

  ttsEvent((textLeft: string) => {
    // if (textLeft === "") {
    //   // done
    //   ttsStop();
    //   // advance to the next article in the category
    //   loadArticle(nextArticleIndex());
    //   setState(ReadingState.LOADING);
    // }
    setRemainingText(textLeft);
  });

  const cancelBtn = () => {
    if (state == ReadingState.PLAYING || state == ReadingState.PAUSED
      || state == ReadingState.PREVIEW) {
      // stop reading whatever
      ttsStop();
      // advance to the next article in the category
      loadArticle(nextArticleIndex());
      setState(ReadingState.LOADING);
    }
  }

  const pauseBtn = () => {
    if (state == ReadingState.PLAYING) {
      // pause reading the article
      ttsStop();
      setState(ReadingState.PAUSED);
    }
    // pause could be joined in state with play
    // and the same control could be used for both
  }

  const playBtn = () => {
    if (state == ReadingState.PRESTART) {
      // being reading the preview of the first article
      loadArticle(0);
      setState(ReadingState.LOADING);
    }

    if (state == ReadingState.PREVIEW) {
      // start reading the article
      ttsSpeak(currentArticle.content);
      setState(ReadingState.PLAYING);
    }

    if (state == ReadingState.PAUSED) {
      // resume reading the article from the last position
      ttsSpeak(remainingText);
      setState(ReadingState.PLAYING);
    }
  }

  const miscAction = () => {
    ttsSpeak("The quick brown fox jumped over the lazy dog");
  }

  return (
    <View style={styles.container}>
      <View>
        {/* <Text style={styles.title}>AMD Assistant</Text> */}
        {/* <View style={styles.separator} /> */}

        <View style={styles.inLine}>
          <UIButton text="I forgot" color="blue" width={47.5}
            onclick={miscAction} />
          <UIButton text="Category" color="blue" width={47.5}
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
