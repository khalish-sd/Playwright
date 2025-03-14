import { When } from '@cucumber/cucumber';
import { PageActions } from '../pages/PageActions';

When('I perform a booking with the following details:', async function (dataTable) {
    const pageActions = new PageActions(this.page);
    await pageActions.performBookingWithDetails(dataTable);
});

When('I perform a login with the following details:', async function (dataTable) {
    const pageActions = new PageActions(this.page);
    await pageActions.performLoginWithDetails(dataTable);
});

// Generic action handler for any table-based operations
When('I perform the following actions:', async function (dataTable) {
    const pageActions = new PageActions(this.page);
    await pageActions.performActionsWithTable(dataTable);
});

When('I enter the following data:', async function (dataTable) {
    const pageActions = new PageActions(this.page);
    await pageActions.performActionsWithTable(dataTable);
});