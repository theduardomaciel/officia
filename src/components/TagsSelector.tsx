import React, { useState } from 'react';
import { useColorScheme } from 'nativewind';

import {
    Text,
    TouchableOpacity,
    FlatList,
    LayoutAnimation,
} from 'react-native';

import { MaterialIcons } from "@expo/vector-icons"
import clsx from 'clsx';
import colors from 'global/colors';

export interface Tag {
    title: string;
    value: string;
    icon?: string;
}

export type TagObject = Tag & {
    checked: boolean;
}

type TagSectionProps = {
    tags: Array<Tag>;
    uniqueSelection?: boolean;
    height?: number;
    onSelectTags: (tags: Tag[]) => void;
    hasClearButton?: boolean;
    insertPaddingRight?: boolean;
    pallette?: "dark";
}

export function TagsSelector({ tags, uniqueSelection, height = 35, hasClearButton, onSelectTags, insertPaddingRight, pallette }: TagSectionProps) {
    const { colorScheme } = useColorScheme();

    const [sectionData, setSectionData] = useState(tags.map((tag: Tag, index: number) => {
        return { ...tag, checked: false }
    }));

    function updateTagsData(updatedSectionData: TagObject[]) {
        const checkedData = [...updatedSectionData].filter(tag => tag.checked === true);
        const uncheckedData = [...updatedSectionData].filter(tag => tag.checked === false);
        const sortedData = checkedData.concat(uncheckedData);
        setSectionData(sortedData);
    }

    const renderItem = ({ item, index }: { item: TagObject, index: number }) => (
        <>
            <TouchableOpacity
                key={item.value}
                className={clsx('bg-black dark:bg-gray-200 rounded-full h-[30px] flex-row px-4 py-1 mr-2 items-center justify-center', {
                    'border-primary-green border-[1.25px]': item.checked,
                    'bg-black dark:bg-gray-300': pallette === "dark",
                })}
                style={height ? { height: height } : {}}
                activeOpacity={0.75}
                onPress={() => {
                    if (hasClearButton) {

                    } else {
                        let updatedSectionData = sectionData

                        if (uniqueSelection) {
                            updatedSectionData = [...sectionData].map(tag => {
                                // Fazemos essa verificação para que seja possível remover a seleção dos outros items
                                if (tag.value !== item.value) {
                                    tag.checked = false;
                                }
                                return tag;
                            })
                        }
                        updatedSectionData.find(tag => tag.value === item.value)!.checked = !item.checked;

                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        onSelectTags(updatedSectionData.filter(tag => tag.checked === true)) // Passa os dados atualizados para o componente pai
                        updateTagsData(updatedSectionData) // Atualiza os dados do componente
                    }
                }}
            >
                {
                    item.icon && <MaterialIcons name={item.icon as unknown as any} size={16} color={colorScheme === "dark" ? colors.text[100] : colors.white} />
                }
                <Text className='text-white dark:text-text-100 text-sm text-center ml-1 mr-2'>
                    {item.title}
                </Text>
                {
                    hasClearButton ? <MaterialIcons name="expand-more" size={18} color={colorScheme === "dark" ? colors.text[100] : colors.white} /> : (
                        item.checked ? <MaterialIcons name="remove" size={18} color={colorScheme === "dark" ? colors.text[100] : colors.white} /> :
                            <MaterialIcons name="add" size={18} color={colorScheme === "dark" ? colors.text[100] : colors.white} />
                    )
                }
            </TouchableOpacity>
            {
                index === sectionData.length - 1 && hasClearButton && <TouchableOpacity className='flex items-center justify-center'>
                    <Text className='text-black dark:text-text-100 text-sm text-center ml-1 alice'>Limpar</Text>
                </TouchableOpacity>
            }
        </>
    );

    return (
        <FlatList
            style={{
                width: "100%",
                height: "auto",
            }}
            contentContainerStyle={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                paddingRight: insertPaddingRight ? 48 : 0,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={sectionData}
            renderItem={renderItem}
            keyExtractor={item => item.value}
        />
    )
}