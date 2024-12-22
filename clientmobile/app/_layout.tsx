
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import { TTSInit } from './tts';
import { UIButton } from './components/UIButton';
import { useState } from 'react';
import { Article, articleCategories, ArticleCategory } from './data';
import { getArticlePreviewsByCategory } from './api';

export default function RootLayout() {

  TTSInit();
  
  const [currentArticle, setCurrentArticle] = useState<Article|null>(null);
  const [articlePreviews, setArticlePreviews] = useState<Article[]>([]);
  const [currentCategory, setCurrentCategory] = useState<ArticleCategory>(articleCategories[0]);

  const nextCategory = () => {
    const currentIndex = articleCategories.indexOf(currentCategory);
    const nextIndex = (currentIndex + 1) % articleCategories.length;
    setCurrentCategory(articleCategories[nextIndex]);
    console.log("BUHUR");
    getArticlePreviewsByCategory(articleCategories[nextIndex]).then(s => setArticlePreviews(s));
  }

  return (
    <View style={styles.container}>
      <View>
        {/* <Text style={styles.title}>AMD Assistant</Text> */}
        {/* <View style={styles.separator} /> */}

        <View style={styles.inLine}>
          <UIButton text="I forgot" color="blue" width={47.5}
            onclick={() => { }} />
          <UIButton text="Category" color="blue" width={47.5}
            onclick={nextCategory} />
        </View>
        <View style={styles.separator} />
        <View style={styles.inLine}>
          <UIButton text="Cancel" color="red" width={30}
            onclick={() => { console.log(currentCategory) }} />
          <UIButton text="Pause" color="orange" width={30}
            onclick={() => { console.log(articlePreviews )}} />
          <UIButton text="Play" color="green" width={30}
            onclick={() => { }} />

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
