import React, { useCallback, useId } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider, Panel3, BrightnessSlider } from 'reanimated-color-picker';

import { v4 as uuidv4 } from 'uuid';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Input from 'components/Input';
import BottomSheet from 'components/BottomSheet';
import { ActionButton } from 'components/Button';

import BusinessLayout from '../Layout';
import { updateData } from 'screens/Main/Business';

// Type
import { BusinessData, Category } from 'screens/Main/Business/@types';
import Label from 'components/Label';
import Modal from 'components/Modal';
import Toast from 'components/Toast';
import Animated, { FadeOut, Layout, SlideInLeft, SlideInRight } from 'react-native-reanimated';

const ICONS = [
    'category',
    'plumbing',
    'bolt',
    'car-repair',
    'account-balance',
    'add-business',
    'agriculture',
    'album',
    'anchor',
    'apartment',
    'architecture',
    'art-track',
    'article',
    'assessment',
    'assignment',
    'assistant-direction',
    'attach-file',
    'attach-money',
    'auto-stories',
    'backpack',
    'bakery-dining',
    'badge',
    'beach-access',
    'bedtime',
    'bike-scooter',
    'biotech',
    'brush',
    'build',
    'business-center',
    'cake',
    'calculate',
    'call',
    'camera-enhance',
    'camera',
    'car-repair',
    'carpenter',
    'celebration',
    'checkroom',
    'child-care',
    'cleaning-services',
    'code',
    'computer',
    'construction',
    'contact-phone',
    'delivery-dining',
    'design-services',
    'device-thermostat',
    'engineering',
    'euro',
    'explore',
    'extension',
    'fastfood',
    'fire-hydrant',
    'flight',
    'grass',
    'headset',
    'highlight',
    'imagesearch-roller',
    'keyboard',
    'king-bed',
    'local-bar',
    'local-cafe',
    'local-dining',
    'local-fire-department',
    'local-hospital',
    'local-hotel',
    'local-library',
    'local-offer',
    'local-police',
    'local-print-shop',
    'local-shipping',
    'music-note',
    'park',
    'people',
    'push-pin',
    'receipt',
    'record-voice-over',
    'spa',
    'sports-esports',
    'stars',
    'store',
    'style',

]

export default function CategoriesScreen({ route }: any) {
    const insets = useSafeAreaInsets();

    const { businessData: data }: { businessData: BusinessData } = route.params;
    const [categories, setCategories] = React.useState<BusinessData['categories']>(data.categories ?? []);
    // este estado é necessário em todas as telas pois o parâmetro de comparação tem que atualizar junto com a atualização dos dados

    const [categoryToEditId, setCategoryToEditId] = React.useState<string | undefined>(undefined);

    const bottomSheet = useId();
    const openBottomSheet = useCallback((id?: string) => {
        setCategoryToEditId(id);
        BottomSheet.expand(bottomSheet);
    }, []);

    const [isColorModalVisible, setColorModalVisible] = React.useState(false);

    const cachedCategoryName = React.useRef<string>("");
    const [newCategoryName, setNewCategoryName] = React.useState<string>("");

    const cachedCategoryColor = React.useRef<string>("");

    const [newCategoryColor, setNewCategoryColor] = React.useState<string>(colors.primary.green);

    const onSelectColor = ({ hex }: { hex: string }) => {
        cachedCategoryColor.current = hex;
    }

    const [isIconModalVisible, setIconModalVisible] = React.useState(false);
    const [newCategoryIcon, setNewCategoryIcon] = React.useState<string>('category');

    async function handleCategory() {
        if (cachedCategoryName.current.length > 0 || newCategoryName.length !== 0) {
            if (categoryToEditId) {
                setCategories((prev) => prev && prev.map((oldCategory) => oldCategory.id === categoryToEditId ?
                    {
                        ...oldCategory,
                        name: cachedCategoryName.current,
                        icon: newCategoryIcon,
                        color: newCategoryColor,
                    }
                    : oldCategory
                ))
                setNewCategoryColor(colors.primary.green);
                setNewCategoryIcon("category");
                setNewCategoryName("");
            } else {
                const newCategory: Category = {
                    id: uuidv4(),
                    name: cachedCategoryName.current.length > 0 ? cachedCategoryName.current : newCategoryName,
                    icon: newCategoryIcon,
                    color: newCategoryColor
                }

                const newCategories = [...categories!, newCategory];
                setCategories(newCategories);
            }
            setHasDifferences(true);
            BottomSheet.close(bottomSheet);
        } else {
            Toast.show({
                preset: 'error',
                title: 'Opa! Algo está errado...',
                message: 'O nome da categoria não pode estar vazio'
            })
        }
    }

    const [hasDifferences, setHasDifferences] = React.useState(false);

    const submitData = () => {
        updateData({ categories }, data);
        setHasDifferences(false);
    }

    return (
        <BusinessLayout
            headerProps={{
                title: 'Categorias',
                description: 'Adicione, gerencie e organize as categorias de seu negócio com facilidade para melhorar a eficiência da gestão de pedidos e agendamentos.',
            }}
            hasDifferences={hasDifferences}
            submitData={submitData}
        >
            <ActionButton
                label='Adicionar categoria'
                icon='add'
                onPress={() => openBottomSheet()}
                style={{
                    paddingTop: 12.5,
                    paddingBottom: 12.5
                }}
            />
            <Animated.FlatList
                data={categories}
                keyExtractor={item => item.id}
                contentContainerStyle={{
                    rowGap: 10
                }}
                renderItem={({ item, index }) => (
                    <TagPreview
                        index={index}
                        tag={item}
                        onDelete={() => {
                            const newCategories = categories && categories.filter(category => category.id !== item.id);
                            setCategories(newCategories);
                            setHasDifferences(true);
                        }}
                        onEdit={() => {
                            setNewCategoryColor(item.color);
                            setNewCategoryIcon(item.icon);
                            setNewCategoryName(item.name);
                            openBottomSheet(item.id);
                        }}
                    />
                )}
                style={{
                    marginTop: 10
                }}
            />

            <BottomSheet
                id={bottomSheet}
                height={"49%"}
            >
                <BottomSheet.Title>
                    {categoryToEditId ? "Editar categoria" : "Adicionar categoria"}
                </BottomSheet.Title>
                <View
                    className="flex flex-1"
                    style={{
                        paddingTop: 24,
                        paddingLeft: 24,
                        paddingRight: 24,
                        paddingBottom: 12 + insets.bottom + 10,
                        rowGap: 25
                    }}
                >
                    <Input
                        label='Nome'
                        pallette='dark'
                        onChangeText={(text) => cachedCategoryName.current = text}
                        onEndEditing={() => setNewCategoryName(cachedCategoryName.current)}
                        defaultValue={newCategoryName}
                        placeholder={'Ex: Elétrico, Hidráulico, etc.'}
                    />
                    <TouchableOpacity
                        activeOpacity={0.75}
                        className='flex-row w-full items-center justify-between'
                        onPress={() => setColorModalVisible(true)}
                    >
                        <View style={{ flex: 1 }}>
                            <Label style={{ marginRight: 10 }}>
                                Cor
                            </Label>
                            <Text className="text-sm leading-4 text-text-200">
                                Escolha uma cor para a categoria
                            </Text>
                        </View>
                        <View
                            className='rounded-full w-10 h-10'
                            style={{
                                backgroundColor: newCategoryColor || "red"
                            }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.75}
                        className='flex-row w-full items-center justify-between'
                        onPress={() => setIconModalVisible(true)}
                    >
                        <View style={{ flex: 1 }}>
                            <Label style={{ marginRight: 10 }}>
                                Ícone
                            </Label>
                            <Text className="text-sm leading-4 text-text-200">
                                Escolha um ícone para a categoria
                            </Text>
                        </View>
                        <View className='w-10 h-10 flex items-center justify-center'>
                            <MaterialIcons name={newCategoryIcon as unknown as any} size={32} color={colors.white} />
                        </View>
                    </TouchableOpacity>
                    {
                        categoryToEditId ? (
                            <ActionButton
                                label={"Editar categoria"}
                                icon={"edit"}
                                style={{ backgroundColor: colors.primary.blue }}
                                onPress={handleCategory}
                            />
                        ) : (
                            <ActionButton
                                label={'Adicionar categoria'}
                                icon={'add'}
                                style={{ backgroundColor: colors.primary.green }}
                                onPress={handleCategory}
                            />
                        )
                    }
                </View>
            </BottomSheet>

            <Modal
                isVisible={isIconModalVisible}
                toggleVisibility={() => setIconModalVisible(false)}
                title="Selecionar ícone"
                icon='category'
            >
                <View className='flex-col w-full mt-4'>
                    <FlatList
                        data={ICONS}
                        keyExtractor={item => item.toString()}
                        numColumns={4}
                        style={{
                            width: "100%",
                            maxHeight: 350,
                        }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            width: "100%",
                            rowGap: 10
                        }}
                        columnWrapperStyle={{
                            justifyContent: 'space-between',
                        }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                activeOpacity={0.75}
                                className='flex items-center justify-between p-4 rounded-sm bg-gray-300'
                                onPress={() => {
                                    setNewCategoryIcon(item);
                                    setIconModalVisible(false);
                                }}
                            >
                                <MaterialIcons name={item as unknown as any} size={28} color={colors.white} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            <Modal
                isVisible={isColorModalVisible}
                toggleVisibility={() => setColorModalVisible(false)}
                title="Selecionar cor"
                icon='palette'
                buttons={[
                    {
                        label: 'Confirmar',
                        onPress: () => {
                            setNewCategoryColor(cachedCategoryColor.current);
                            cachedCategoryColor.current = "";
                        },
                        closeOnPress: true
                    }
                ]}
                cancelButton
            >
                <View className='flex-col w-full mt-4'>
                    <ColorPicker
                        style={{ rowGap: 20, flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                        value={newCategoryColor ?? colors.primary.green}
                        onComplete={onSelectColor}
                    >
                        <Panel3 style={{ width: "100%" }} />
                        <BrightnessSlider style={{ minWidth: "100%" }} />
                        <Swatches swatchStyle={{ shadowOpacity: 0 }} style={{ shadowOpacity: 0 }} />
                    </ColorPicker>
                </View>
            </Modal>
        </BusinessLayout>
    )
}

const TagPreview = ({ index, tag, onDelete, onEdit }: { index: number, tag: Category, onDelete: () => void, onEdit: () => void }) => {
    return (
        <Animated.View
            entering={SlideInLeft.delay(index * 100).springify().damping(25)}
            exiting={FadeOut.duration(200)}
            layout={Layout.springify()}
            className='flex-row items-center justify-between w-full rounded-sm px-3 py-3'
            style={{
                borderWidth: 1,
                borderColor: tag.color,
            }}
        >
            <View className='flex-row items-center justify-start' style={{ columnGap: 10 }}>
                <MaterialIcons name={tag.icon as unknown as any} size={20} color={colors.white} />
                <Text className='font-semibold text-sm text-white'>
                    {tag.name}
                </Text>
            </View>
            <View className='flex-row items-center justify-end' style={{ columnGap: 25 }}>
                <MaterialIcons name='edit' size={20} color={colors.white} onPress={onEdit} />
                <MaterialIcons name='delete' size={20} color={colors.white} onPress={onDelete} />
            </View>
        </Animated.View>
    )
}