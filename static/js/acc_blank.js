var ACC = ACC || {};

ACC.CONFIG = ACC.CONFIG || {};
ACC.CONFIG.DEBUG = true; //Turn on some logging to console

ACC.testConsole = function(){

    var $alert,
        loadedAccounts;

    /**
     * Starting point
     * @return void
     */
    this.init = function(){

        $alert = $('.alert');

        getAccounts();
        bindForms();
    };

    /**
     * Get all accounts for dropdowns
     * @return void
     */
    this.getAccounts = function(){

        ACC.core.getAccounts().done(function(accounts){

            loadedAccounts = accounts;

            for(var index in accounts){

                var account = accounts[index];
                var $select = $('<option></option>');

                $select.html(account.id + "  " + account.parent_name + ' - ' + account.child_name);
                $select.val(account.id);

                $('.js-accounts-select').append($select);
            }

            changeUpdateFormValues(accounts[0]);
        });

    };

    /**
     * Update the update form with account values
     * @param  Object account
     * @return void
     */
    this.changeUpdateFormValues = function(account){

        $('.js-update-account').find('input').val('');

        for(var field in account){
            $('.js-update-account').find('input[name=' + field +']').val(account[field]);
        }

    };

    /**
     * Bind events to forms
     * @return void
     */
    this.bindForms = function(){

        //Create
        $('.js-create-account').on('submit', function(e){
            e.preventDefault();

            var data = getInputData($(this));

            ACC.core.createAccount(data).done(function(response){
                $alert.html('Created account: ' + response.id);
            });

        });

        //Update
        $('.js-update-account').on('submit', function(e){
            e.preventDefault();

            var data = getInputData($(this));

            data.goal = {};

            data.goal.name = data.goal_name;
            data.goal.value = data.goal_value;
            data.goal.type = data.goal_type;

            delete data.goal_name;
            delete data.goal_value;
            delete data.goal_type;

            ACC.core.updateAccount(data).done(function(response){
                $alert.html('Updated account: ' + response.id);
            });
        });

        //Read/Get single
        $('.js-get-account').on('submit', function(e){
            e.preventDefault();

            var data = getInputData($(this));

            ACC.core.getAccount(data).done(function(response){

                $dl = $('<form class="js-update-account">');
                $dl.append('<h2>Account details:</h2>');
                $dl.append('<input type="hidden" name = "id" value="'+response.id+'"/>');
                $dl.append('<dl>');
                $dl.append('<dt>Parent Name</dt><dd><div class="js-acc-description">' + response.parent_name + '</div>'+
                    '<div class="js-acc-update"><input type="text" name="parent_name" value="' + response.parent_name + '" /></div></dd>');
                $dl.append('<dt>Child Name</dt><dd><div class="js-acc-description">' + response.child_name + '</div>'+
                    '<div class="js-acc-update"><input type="text" name="child_name" value="' + response.child_name + '" /></div></dd>');
                $dl.append('<dt>Current Date</dt><dd><div class="js-acc-description">' + moment.utc(response.current_date).format('DD-MM-YY') + '</div>'+
                    '<div class="js-acc-update"><input type="text" name="current_date" value="' + moment.utc(response.current_date).format('DD-MM-YY') + '" /></div></dd>');
                $dl.append('<dt>Loan Rate</dt><dd><div class="js-acc-description">' + response.loan_rate + '</div>'+
                    '<div class="js-acc-update"><input type="text" name="loan_rate" value="' + response.loan_rate + '" /></div></dd>');
                $dl.append('<dt>Saving Rate</dt><dd><div class="js-acc-description">' + response.saving_rate + '</div>'+
                    '<div class="js-acc-update"><input type="text" name="saving_rate" value="' + response.saving_rate + '" /></div></dd>');
                $dl.append('<dt>Pocket Money Amount</dt><dd><div class="js-acc-description">' + response.pocket_money_amount + '</div>'+
                    '<div class="js-acc-update"><input type="text" name="pocket_money_amount" value="' + response.pocket_money_amount + '" /></div></dd>');
                $dl.append('<dt>Pocket Money Day</dt><dd><div class="js-acc-description">' + response.pocket_money_day + '</div>'+
                    '<div class="js-acc-update"><input type="text" name="pocket_money_day" value="' + response.pocket_money_day + '" /></div></dd>');
                $dl.append('<dt>Balance</dt><dd><div class="js-acc-description">' + response.balance + '</div>'+
                    '<div class="js-acc-update"><input type="text" name="balance" value="' + response.balance + '" /></div></dd>');

                if(typeof response.transactions === 'object'){
                    $dl.append('<dt>Transaction count</dt><dd>' + response.transactions.length + '</dd>');
                }


                if(typeof response.goal === 'object'){
                    $dl.append('<dt>Goal name</dt><dd>' + response.goal.name + '</dd>');
                    $dl.append('<dt>Goal value</dt><dd>' + response.goal.value + '</dd>');
                    $dl.append('<dt>Goal type</dt><dd>' + response.goal.type + '</dd>');
                }


                $dl.append("<button id='showUpdateAccount' class='button1'>Edit account info</button>");
                $dl.append("<button id='updateAccountInfo' class='button2'>Save changes</button>");
                    
                $('.js-info-wrapper').html($dl);

            });
        });

        //Create transaction
        $('.js-create-transaction').on('submit', function(e){
            e.preventDefault();

            var data = getInputData($(this));
            var type = $(this).find('input[type=radio]:checked').val();

            if(type === undefined)
                type = 'withdrawal';

            if(type === 'withdrawal')
                data.withdrawal = true;
            else
                data.withdrawal = false;

            if(type === 'deposit')
                data.deposit = true;
            else
                data.deposit = false;


            data.account_id = data.id;

            delete data.type;
            delete data.id;

            ACC.core.createTransaction(data).done(function(response){
                $alert.html('Transaction created');
            });

        });

        //View all transactions for account
         $('.js-view-transactions').on('submit', function(e){
            e.preventDefault();

            var data = getInputData($(this));

            data.type = $(this).find('input[type=radio]:checked').val();

            if(data.type === undefined)
                data.type = 'either';


            ACC.core.getTransactions(data).done(function(response){
                buildTransactionTable(response.transactions);
            });

        });

        //Increment account
        $('.js-increment-account').on('submit', function(e){

            e.preventDefault();

            var data = getInputData($(this));

            var increment = ACC.core.incrementAccount(data);
            increment.done(function(response){
                buildTransactionTable(response.transactions);
            });
            increment.fail(function(){
                console.log("FAIL");
            });
        });

        //Init date picker
        $('.js-datepicker').datepicker({dateFormat: "dd-mm-yy"});

        //When account changes update fields.
        $('.js-accounts-select-update').on('change', function(e){
            var id = $(this).val();

            for(var index in loadedAccounts){
                var account = loadedAccounts[index];
                if(account.id == id){
                    changeUpdateFormValues(account);
                }
            }
        });
    };

    /**
     * Get input data from form helper
     * @param  Object form   jQuery object
     * @return void
     */
    this.getInputData = function(form){

        var data = {};

        form.find('input,select').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });

        return data;
    };

    /**
     * Build HTML table for transactions data
     * @param  Array transactions
     * @return void
     */
    this.buildTransactionTable = function(transactions){

        var $table = $('<table class="table table-striped"><th>Amount</th><th>Type</th><th>Description</th><th>Date</th></table>');

        for(var index in transactions){

            var transaction = transactions[index];

            var $row = $('<tr></tr>');

            var type = (transaction.withdrawal) ? 'withdrawal' : 'deposit';

            $row.append('<td>' + transaction.amount + '</td><td>' + type + '</td><td>' + transaction.description + '</td><td>' + moment.utc(transaction.date).format('DD/MM/YY') + '</td>');

            $table.append($row);
        }

        $('.js-table-holder').html($table);
    };


    return {
        init: init
    };
}();

$('.js-info-wrapper').on('click', '#showUpdateAccount', function() {

    if ($(this).html() == 'Back') {
        $(this).html('Edit account info');
        $('#updateAccountInfo').hide();
    } else {
       $(this).html('Back');
       $('#updateAccountInfo').show();
    }
    
    $('.js-acc-description').toggle();
    $('.js-acc-update').toggle();
});

$(document).ready(function(){
    ACC.testConsole.init();
});