import React, { FC, memo, useMemo, useState } from "react";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";

import ContentStyles from "./Content.styles";
import { StoryContentProps } from "../../core/dto/componentsDTO";
import { View } from "react-native";

const StoryContent: FC<StoryContentProps> = ({
  stories,
  active,
  activeStory,
}) => {
  const [storyIndex, setStoryIndex] = useState(0);

  const onChange = async () => {
    "worklet";

    const index = stories.findIndex((item) => item.id === activeStory.value);
    if (active.value && index >= 0 && index !== storyIndex) {
      runOnJS(setStoryIndex)(index);
    }
  };

  useAnimatedReaction(
    () => activeStory.value,
    (res, prev) => res !== prev && onChange(),
    [activeStory.value]
  );

  const content = useMemo(
    () => stories[storyIndex]?.renderContent?.(),
    [storyIndex]
  );

  return content ? (
    <View style={ContentStyles.container} pointerEvents="box-none">
      {content}
    </View>
  ) : null;
};

export default memo(StoryContent);
