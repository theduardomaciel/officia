import React, { useState } from 'react';

import {
    Text,
    TouchableOpacity,
    UIManager,
    FlatList,
    LayoutAnimation,
    Platform,
} from 'react-native';

import { MaterialIcons } from "@expo/vector-icons"
import clsx from 'clsx';
import colors from 'global/colors';

export interface Tag {
    id: number;
    title: string;
    icon?: string;
    checked: boolean;
}

type TagSectionProps = {
    tags: Array<Tag>;
    uniqueSelection?: boolean;
    height?: number;
    onSelectTags: (tags: Tag[]) => void;
}

export function TagsSelector({ tags, uniqueSelection, height = 35, onSelectTags }: TagSectionProps) {
    const [sectionData, setSectionData] = useState(tags.map(tag => {
        return { ...tag, checked: false }
    }));

    function updateTagsData(updatedSectionData: Tag[]) {
        const checkedData = [...updatedSectionData].filter(tag => tag.checked === true);
        const uncheckedData = [...updatedSectionData].filter(tag => tag.checked === false);
        const sortedData = checkedData.concat(uncheckedData);
        setSectionData(sortedData);
    }

    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const renderItem = ({ item }: { item: Tag }) => (
        <TouchableOpacity
            key={item.id}
            className={clsx('bg-bg-200 rounded-full h-[30px] flex-row px-4 py-1 mr-2 items-center justify-center', {
                'border-primary-green border-[1.25px]': item.checked,
            })}
            style={height ? { height: height } : {}}
            activeOpacity={0.75}
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
                console.log(updatedSectionData)
                updatedSectionData.find(tag => tag.id === item.id)!.checked = !item.checked;

                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); //.spring
                onSelectTags(updatedSectionData) // Passa os dados atualizados para o componente pai
                updateTagsData(updatedSectionData) // Atualiza os dados do componente
            }}
        >
            {
                item.icon && <MaterialIcons name={item.icon as unknown as any} size={16} color={colors.text[100]} />
            }
            <Text className='text-text-100 text-sm text-center ml-1 mr-2 text'>
                {item.title}
            </Text>
            {
                item.checked ? <MaterialIcons name="remove" size={18} color={colors.text[100]} /> :
                    <MaterialIcons name="add" size={18} color={colors.text[100]} />
            }
        </TouchableOpacity>
    );

    return (
        <FlatList
            style={{
                width: "100%",
                height: "auto",
            }}
            /* contentContainerStyle={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "flex-start",
            }} */
            horizontal
            showsHorizontalScrollIndicator={false}
            data={sectionData}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
        />
    )
}