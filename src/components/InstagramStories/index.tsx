import {
  ANIMATION_DURATION,
  AVATAR_SIZE,
  BACKGROUND_COLOR,
  CLOSE_COLOR,
  DEFAULT_COLORS,
  SEEN_LOADER_COLORS,
  STORY_AVATAR_SIZE,
} from "../../core/constants";
import { Image, ScrollView } from "react-native";
import {
  InstagramStoriesProps,
  InstagramStoriesPublicMethods,
} from "../../core/dto/instagramStoriesDTO";
import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  clearProgressStorage,
  getProgressStorage,
  setProgressStorage,
} from "../../core/helpers/storage";

import { ProgressStorageProps } from "../../core/dto/helpersDTO";
import StoryAvatar from "../Avatar";
import StoryModal from "../Modal";
import { StoryModalPublicMethods } from "../../core/dto/componentsDTO";
import { useSharedValue } from "react-native-reanimated";

const InstagramStories = forwardRef<
  InstagramStoriesPublicMethods,
  InstagramStoriesProps
>(
  (
    {
      stories,
      showAvatars = true,
      saveProgress = false,
      avatarBorderColors = DEFAULT_COLORS,
      avatarSeenBorderColors = SEEN_LOADER_COLORS,
      avatarSize = AVATAR_SIZE,
      storyAvatarSize = STORY_AVATAR_SIZE,
      listContainerStyle,
      listContainerProps,
      animationDuration = ANIMATION_DURATION,
      backgroundColor = BACKGROUND_COLOR,
      showName = false,
      nameTextStyle,
      videoAnimationMaxDuration,
      videoProps,
      closeIconColor = CLOSE_COLOR,
      ...props
    },
    ref
  ) => {
    const [data, setData] = useState(stories);
    const seenStories = useSharedValue<ProgressStorageProps>({});
    const loadedStories = useSharedValue(false);
    const loadingStory = useSharedValue<string | undefined>(undefined);
    const modalRef = useRef<StoryModalPublicMethods>(null);

    const onPress = (id: string) => {
      "wokrlet";
      loadingStory.value = id;

      if (loadedStories.value) {
        modalRef.current?.show(id);
      }
    };

    const onLoad = () => {
      "wokrlet";
      loadingStory.value = undefined;
    };

    const onStoriesChange = async () => {
      "wokrlet";

      seenStories.value = await (saveProgress ? getProgressStorage() : {});

      const promises = stories.map((story) => {
        const seenStoryIndex = story.stories.findIndex(
          (item) => item.id === seenStories.value[story.id]
        );
        const seenStory = story.stories[seenStoryIndex + 1] || story.stories[0];

        if (seenStory.mediaType === "image") {
          return Image.prefetch(seenStory.sourceUrl);
        }

        return true;
      });

      await Promise.all(promises);

      loadedStories.value = true;

      if (loadingStory.value) {
        onPress(loadingStory.value);
      }
    };

    const onSeenStoriesChange = async (user: string, value: string) => {
      if (!saveProgress) {
        return;
      }

      if (seenStories.value[user]) {
        const userData = data.find((story) => story.id === user);
        const oldIndex = userData?.stories.findIndex(
          (story) => story.id === seenStories.value[user]
        );
        const newIndex = userData?.stories.findIndex(
          (story) => story.id === value
        );

        if (oldIndex! > newIndex!) {
          return;
        }
      }

      seenStories.value = await setProgressStorage(user, value);
    };

    useImperativeHandle(
      ref,
      () => ({
        spliceStories: (newStories, index) => {
          if (index === undefined) {
            setData([...data, ...newStories]);
          } else {
            const newData = [...data];
            newData.splice(index, 0, ...newStories);
            setData(newData);
          }
        },
        spliceUserStories: (newStories, user, index) => {
          const userData = data.find((story) => story.id === user);

          if (!userData) {
            return;
          }

          const newData =
            index === undefined
              ? [...userData.stories, ...newStories]
              : [...userData.stories];

          if (index !== undefined) {
            newData.splice(index, 0, ...newStories);
          }

          setData(
            data.map((value) =>
              value.id === user
                ? {
                    ...value,
                    stories: newData,
                  }
                : value
            )
          );
        },
        setStories: (newStories) => {
          setData(newStories);
        },
        clearProgressStorage,
        hide: () => modalRef.current?.hide(),
        show: (id) => {
          if (id) {
            onPress(id);
          } else if (data[0]?.id) {
            onPress(data[0]?.id);
          }
        },
      }),
      [data]
    );

    useEffect(() => {
      onStoriesChange();
    }, [data]);

    useEffect(() => {
      setData(stories);
    }, [stories]);

    return (
      <>
        {showAvatars && (
          <ScrollView
            horizontal
            {...listContainerProps}
            contentContainerStyle={listContainerStyle}
            testID="storiesList"
          >
            {data.map(
              (story) =>
                story.imgUrl && (
                  <StoryAvatar
                    {...story}
                    loadingStory={loadingStory}
                    seenStories={seenStories}
                    onPress={() => onPress(story.id)}
                    colors={avatarBorderColors}
                    seenColors={avatarSeenBorderColors}
                    size={avatarSize}
                    showName={showName}
                    nameTextStyle={nameTextStyle}
                    key={`avatar${story.id}`}
                  />
                )
            )}
          </ScrollView>
        )}

        <StoryModal
          ref={modalRef}
          stories={data}
          seenStories={seenStories}
          duration={animationDuration}
          storyAvatarSize={storyAvatarSize}
          onLoad={onLoad}
          onSeenStoriesChange={onSeenStoriesChange}
          backgroundColor={backgroundColor}
          videoDuration={videoAnimationMaxDuration}
          videoProps={videoProps}
          closeIconColor={closeIconColor}
          {...props}
        />
      </>
    );
  }
);

export default memo(InstagramStories);
