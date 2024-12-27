import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Source from "./Source";
import Expence from "./Expence";
import Product from "./Product";
import Reports from "./Reports"
import SourceReport from "./SourceReport"
import CategoryReport from "./CategoryReport"
import ProductReport from "./ProductReport"
import ExpenceReport from "./ExpenceReport"

const App = () => {
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'source', title: 'Source', focusedIcon: 'heart', unfocusedIcon: 'heart-outline' },
        { key: 'category', title: 'Category', focusedIcon: 'history' },
        { key: 'expence', title: 'Expence', focusedIcon: 'album' },
        { key: 'reports', title: 'Reports', focusedIcon: 'album' },
    ]);

    const renderScene = BottomNavigation.SceneMap({
        source: Source,
        category: Product,
        expence: Expence,
        reports:ProductReport
    });


    return (
        <SafeAreaProvider>
            <BottomNavigation
                navigationState={{ index, routes }}
                onIndexChange={setIndex}
                renderScene={renderScene}
            />
        </SafeAreaProvider>
    );
};

export default App;
