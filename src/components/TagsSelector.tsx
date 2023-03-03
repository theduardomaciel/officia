import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import { Text, TouchableOpacity, FlatList, LayoutAnimation, TouchableOpacityProps, Platform, UIManager, View } from 'react-native';

import { useColorScheme } from 'nativewind';
import { MaterialIcons } from "@expo/vector-icons"
import colors from 'global/colors';

import { Category } from 'screens/Main/Business/@types';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type PartialCategory = PartialBy<Category, 'icon' | 'color'>;

export type TagObject = PartialCategory & {
    checked?: boolean;
}

type TagSectionProps = {
    tags: Array<PartialCategory>;
    uniqueSelection?: boolean;
    insertPaddingRight?: boolean;
    pallette?: "dark";
    height?: number;
    onSelectTags: (tags: TagObject[]) => void;
    onClear?: () => void;
}

interface TagProps extends TagObject {
    children?: React.ReactNode;
    pallette?: TagSectionProps['pallette'];
    onPress?: TouchableOpacityProps['onPress'];
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const Tag = ({ onPress, children, pallette, checked, icon, name, color }: TagProps) => {
    const { colorScheme } = useColorScheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={onPress ? 0.75 : 1}
            className={clsx('bg-black dark:bg-gray-200 rounded-full h-full flex-row px-4 py-1 mr-2 items-center justify-center', {
                'bg-black dark:bg-gray-300': pallette === "dark",
            })}
            style={{
                ...(checked && { borderWidth: 1, borderColor: color || colors.gray[300] }),
                columnGap: 5
            }}
        >
            {
                icon && <MaterialIcons name={icon as unknown as any} size={16} color={colorScheme === "dark" ? colors.text[100] : colors.white} />
            }
            <Text className='text-white dark:text-text-100 text-sm text-center ml-1'>
                {name}
            </Text>
            {children}
        </TouchableOpacity>
    )
}

export function TagsSelector({ tags, uniqueSelection, onClear, onSelectTags, insertPaddingRight, pallette, height }: TagSectionProps) {
    const { colorScheme } = useColorScheme();
    const [sectionData, setSectionData] = useState<TagObject[]>(tags);
    /* .map(tag => ({ ...tag, checked: false })) */

    useEffect(() => {
        setSectionData(tags);
    }, [tags])

    function updateTagsData(updatedSectionData: TagObject[]) {
        const checkedData = [...updatedSectionData].filter(tag => tag.checked);
        console.log(checkedData)
        const uncheckedData = [...updatedSectionData].filter(tag => !tag.checked);
        const sortedData = checkedData.concat(uncheckedData);
        setSectionData(sortedData);
    }

    const renderItem = ({ item, index }: { item: TagObject, index: number }) => (
        <View className='h-full'>
            <Tag
                key={item.id}
                pallette={pallette}
                {...item}
                onPress={() => {
                    let updatedSectionData = sectionData

                    if (uniqueSelection) {
                        updatedSectionData = [...sectionData].map(tag => {
                            // Fazemos essa verificação para que seja possível remover a seleção dos outros items
                            if (tag.id !== item.id) {
                                tag.checked = false;
                            }
                            return tag;
                        })
                    }
                    updatedSectionData.find(tag => tag.id === item.id)!.checked = !item.checked;

                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

                    onSelectTags(updatedSectionData.filter(tag => tag.checked === true)) // Passa os dados atualizados para o componente pai
                    updateTagsData(updatedSectionData) // Atualiza os dados do componente
                }}
            >
                {
                    onClear ? <MaterialIcons name="expand-more" size={18} color={colorScheme === "dark" ? colors.text[100] : colors.white} /> : (
                        item.checked ?
                            <MaterialIcons name="remove" size={18} color={colorScheme === "dark" ? colors.text[100] : colors.white} /> :
                            <MaterialIcons name="add" size={18} color={colorScheme === "dark" ? colors.text[100] : colors.white} />
                    )
                }
            </Tag>
        </View>
    );

    return (
        <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={[
                {
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingRight: insertPaddingRight ? 48 : 0,
                },
                height ? { height: height } : { height: "100%" }
            ]}
            ListFooterComponent={onClear ? (
                <TouchableOpacity className='flex items-center justify-center mr-4'>
                    <Text className='text-black dark:text-text-100 text-sm text-center ml-1 alice'>Limpar</Text>
                </TouchableOpacity>
            ) : <></>}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={sectionData}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id ?? index.toString()}
        />
    )
}