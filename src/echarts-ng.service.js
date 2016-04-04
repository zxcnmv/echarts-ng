(function (angular) {
  "use strict";

  angular.module('echarts-ng').provider('$echarts', EchartsAssistanceProvider);

  /**
   * @ngdoc service
   * @name echarts-ng.service:$echartsProvider
   *
   * @description - echarts-ng util service
   */
  function EchartsAssistanceProvider() {
    var ctx = this;

    // base echarts options
    ctx.GLOBAL_OPTION = {
      title: {
        left: 'center',
        top: 'top',
        padding: [20, 10, 10, 10]
      },
      backgroundColor: 'rgba(255, 255, 255, .5)',
      legend: {
        left: 'center',
        top: 'top',
        padding: [20, 10, 10, 10]
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      }
    };

    // modify base echarts options
    ctx.setGlobalOption = function(option) {
      angular.extend(ctx.GLOBAL_OPTION, option);
    };

    /**
     * @ngdoc service
     * @name echarts-ng.service:$echarts
     *
     * @requires $q
     * @requires $timeout
     *
     * @description - echarts-ng util method
     */
    ctx.$get = ['$q', '$timeout', function($q, $timeout) {
      var assistance = {};

      /**
       * @ngdoc property
       * @name echarts-ng.service:storage
       *
       * @type {object}
       *
       * @description - storage for echarts instance
       */
      assistance.storage = new Map();
      assistance.generateInstanceIdentity = generateInstanceIdentity;
      assistance.getEchartsGlobalOption = getEchartsGlobalOption;
      assistance.registerEchartsInstance = registerEchartsInstance;
      assistance.queryEchartsInstance = queryEchartsInstance;
      assistance.removeEchartsInstance = removeEchartsInstance;
      assistance.updateEchartsInstance = updateEchartsInstance;

      return assistance;

      /**
       * @ngdoc method
       * @methodOf echarts-ng.service:$echarts
       * @name echarts-ng.service:$echarts#getEchartsGlobalOption
       *
       * @description - query the global base echarts option
       */
      function getEchartsGlobalOption() {
        return ctx.GLOBAL_OPTION;
      }

      /**
       * @ngdoc method
       * @methodOf echarts-ng.service:$echarts
       * @name echarts-ng.service:$echarts#generateInstanceIdentity
       *
       * @return {string}
       *
       * @description - generate unique id for different echarts instance
       */
      function generateInstanceIdentity() {
        return Math.random().toString(36).substr(2, 9);
      }

      /**
       * @ngdoc method
       * @methodOf echarts-ng.service:$echarts
       * @name echarts-ng.service:$echarts#registerEchartsInstance
       *
       * @description - store the specific instance
       */
      function registerEchartsInstance(identity, instance) {
        assistance.storage.set(identity, instance);
      }

      /**
       * @ngdoc method
       * @methodOf echarts-ng.service:$echarts
       * @name echarts-ng.service:$echarts#queryEchartsInstance
       *
       * @param {string} identity - the unique instance id generated by {@link echarts-ng.service:$echarts#generateInstanceIdentity}
       * @return {promise<object>}
       *
       * @description - get the specific echarts instance for event bind or something else
       */
      function queryEchartsInstance(identity) {
        var deferred = $q.defer();

        $timeout(function() {
          if (assistance.storage.has(identity)) {
            deferred.resolve(assistance.storage.get(identity));
          } else {
            console.error('Echarts Identity Not Registered, Please Verify The Process');
            deferred.reject({errorDesc: 'Echarts Identity Not Registered, Please Verify The Process'});
          }
        }, 0);

        return deferred.promise;
      }

      /**
       * @ngdoc method
       * @methodOf echarts-ng.service:$echarts
       * @name echarts-ng.service:$echarts#removeEchartsInstance
       *
       * @description - remove specific instance
       */
      function removeEchartsInstance(identity) {
        if (assistance.storage.has(identity)) {
          assistance.storage.delete(identity);
        }
      }

      /**
       * @ngdoc method
       * @methodOf echarts-ng.service:$echarts
       * @name echarts-ng.service:$echarts#updateEchartsInstance
       *
       * @description - update the instance, switch between loading and draw
       */
      function updateEchartsInstance(identity, option) {
        var instance = assistance.storage.get(identity);

        if (angular.isUndefined(instance)) {
          console.warning("The instance not registered. Probably the exception belongs to the directive wrap");
          return;
        }

        if (angular.isObject(option) && angular.isArray(option.series) && option.series.length) {
          instance.hideLoading();
          instance.setOption(option);
        } else {
          instance.clear();
          instance.showLoading();
        }
      }
    }];
  }
})(angular);